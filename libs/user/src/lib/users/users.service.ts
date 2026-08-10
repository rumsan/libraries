import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientProxy } from '@nestjs/microservices';
import { Prisma, PrismaClient, Service, User } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import {
  AssignRoleDto,
  CreateUserDto,
  ListUserDto,
  UpdateRoleAssignmentDto,
  UpdateUserDto,
} from '@rumsan/extensions/dtos';
import { paginator, PaginatorTypes, PrismaService } from '@rumsan/prisma';
import { Request, UserRole } from '@rumsan/sdk/types';
import { UUID } from 'crypto';
import { AUTH_SERVICE_CLIENT } from '../ability/ms-rpc-auth';
import { CUI } from '../auths/interfaces/current-user.interface';
import { ERRORS, EVENTS } from '../constants';
import { RSE } from '../constants/errors';
import { UserDataToValidate } from '../interfaces';
import { createChallenge, decryptChallenge } from '../utils/challenge.utils';
import { getSecret } from '../utils/config.utils';
import {
  getServiceTypeByAddress,
  getVerificationEventName,
} from '../utils/service.utils';

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 20 });
type PrismaClientType = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  '$on' | '$connect' | '$disconnect' | '$use' | '$transaction' | '$extends'
>;

@Injectable()
export class UsersService {
  private rsprisma;
  constructor(
    protected prisma: PrismaService,
    protected eventEmitter: EventEmitter2,
    @Inject(AUTH_SERVICE_CLIENT)
    private readonly authClient: ClientProxy,
  ) {
    this.rsprisma = this.prisma.rsclient;
  }

  async create(
    dto: CreateUserDto,
    callback?: (
      err: Error | null,
      tx: PrismaClientType,
      user: User | null,
    ) => void,
  ): Promise<User> {
    return this.prisma.$transaction(async (tx) => {
      try {
        const { roles, ...data } = dto;

        // Set lowercase username for lookups
        const userData: any = { ...data };
        if (data.username) {
          userData.usernameLower = data.username.toLowerCase();
        }

        // Validate user data and check for duplicates
        await this._validateUserData(tx, userData);

        const user = await tx.user.create({
          data: userData,
        });

        if (roles?.length) {
          await this.addRoles(user.uuid as UUID, roles, tx);
        }

        // Create authentication records
        await this._createAuthRecords(tx, user.id, data);

        if (callback) {
          await callback(null, tx, user);
        }
        this.eventEmitter.emit(EVENTS.USER_CREATED, {
          address: user.email,
        });
        return user;
      } catch (error: any) {
        if (callback) {
          await callback(error, tx, null);
        }
        throw error;
      }
    });
  }

  private async _createAuth(
    userId: number,
    service: Service,
    serviceId: string | null,
    prisma: PrismaClientType,
  ): Promise<void> {
    if (!prisma) prisma = this.prisma;
    if (serviceId) {
      // Check if auth record already exists for this user and service
      const existingUserAuth = await prisma.auth.findFirst({
        where: { userId, service },
      });

      if (existingUserAuth) {
        throw ERRORS.AUTH_SERVICE_EXISTS;
      }

      // For USERNAME service, also set serviceIdLower for case-insensitive lookups
      const authData: any = { userId, service, serviceId };
      if (service === Service.USERNAME) {
        authData.serviceIdLower = serviceId.toLowerCase();
      }

      await prisma.auth.create({
        data: authData,
      });
    }
  }

  async list(dto: ListUserDto): Promise<PaginatorTypes.PaginatedResult<User>> {
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    orderBy[dto.sort] = dto.order;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    };
    if (dto.roles) {
      const rolesArray = dto.roles.split(',').map((role) => role.trim());
      where.UserRole = {
        some: {
          Role: {
            name: {
              in: rolesArray,
              mode: 'insensitive',
            },
          },
        },
      };
    }

    return paginate(
      this.prisma.user,
      {
        where,
        orderBy,
        include: {
          UserRole: {
            include: {
              Role: true,
            },
          },
        },
      },
      {
        page: dto.page,
        perPage: dto.perPage,
      },
    );
  }

  async getById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });
  }

  async get(uuid: UUID, prisma?: PrismaClientType) {
    if (!prisma) prisma = this.prisma;
    const user = await prisma.user.findUnique({
      where: { uuid, deletedAt: null },
      include: {
        UserRole: {
          include: {
            Role: true,
          },
        },
      },
    });
    return user;
  }

  async update(uuid: UUID, dto: UpdateUserDto) {
    return this.prisma.$transaction(async (tx) => {
      const user = await this._findUserByUuid(uuid, tx);

      // Validate user data and check for duplicates (excluding current user)
      await this._validateUserData(tx, dto, user.id);

      // Update user details
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { ...dto },
      });

      // Update authentication records
      await this._updateAuthRecords(tx, user, dto);

      return updatedUser;
    });
  }

  private async _updateAuth(
    tx: PrismaClientType,
    user: User,
    service: Service,
    newServiceId?: string | null,
  ): Promise<void> {
    if (newServiceId) {
      const existingAuth = await tx.auth.findFirst({
        where: {
          userId: user.id,
          service,
        },
      });

      if (existingAuth) {
        // If there is an existing authentication entry, update it
        await tx.auth.update({
          where: { id: existingAuth.id },
          data: { serviceId: newServiceId },
        });
      } else {
        // If there is no existing entry, create a new one
        await tx.auth.create({
          data: { userId: user.id, service, serviceId: newServiceId },
        });
      }
    }
  }

  async updateMe(userId: number, dto: UpdateUserDto, rdetails: Request) {
    return this.prisma.$transaction(async (tx) => {
      const user = await this._findUserById(userId, tx);

      const { email, phone, wallet, ...data } = dto;

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data,
      });

      // Helper function to create a verification challenge and emit an event
      const emitVerificationEvent = async (
        service: Service,
        address?: string,
      ) => {
        if (address) {
          const { challenge } = createChallenge(getSecret(), {
            address,
            ip: rdetails.ip,
            data: { userId: user.id },
          });
          this.eventEmitter.emit(getVerificationEventName(service), {
            address,
            challenge,
          });
        }
      };

      // Emit verification events for email, phone, and wallet
      await emitVerificationEvent(Service.EMAIL, email);
      await emitVerificationEvent(Service.PHONE, phone);
      await emitVerificationEvent(Service.WALLET, wallet);

      return updatedUser;
    });
  }

  async processVerificationChallenge(challenge: string, rdetails: Request) {
    const payload = decryptChallenge(getSecret(), challenge, 1200);

    if (!payload.address) {
      throw ERRORS.INVALID_CHALLENGE;
    }

    if (payload.ip !== rdetails.ip) {
      throw ERRORS.IP_MISMATCH;
    }

    const user = await this._findUserById(payload.data['userId']);

    const service = getServiceTypeByAddress(payload.address);
    if (!service) {
      throw ERRORS.INVALID_SERVICE;
    }

    const data: UserDataToValidate = {};
    if (service === Service.EMAIL) data.email = payload.address;
    if (service === Service.PHONE) data.phone = payload.address;
    if (service === Service.WALLET) data.wallet = payload.address;

    await this.prisma.$transaction(async (tx) => {
      // Validate user data and check for duplicates (excluding current user)
      await this._validateUserData(tx, data, user.id);

      await this._updateAuth(tx, user, service, payload.address);
      await tx.user.update({
        where: { id: user.id },
        data,
      });
    });
  }

  async delete(uuid: UUID, currentUser?: CUI): Promise<User> {
    try {
      if (currentUser) {
        const { uuid: currentUseruuid, sessionId } = currentUser;
        return await this.rsprisma.user.softDelete(
          { uuid },
          currentUseruuid,
          sessionId,
        );
      } else {
        return await this.rsprisma.user.softDelete({ uuid });
      }
    } catch (err) {
      throw ERRORS.USER_DELETE_FAILED;
    }
  }

  async listRoles(uuid: UUID, prisma?: PrismaClientType): Promise<UserRole[]> {
    if (!prisma) prisma = this.prisma;
    const user = await this.get(uuid, prisma);
    if (!user) throw ERRORS.USER_NOT_FOUND;
    const roles = await prisma.userRole.findMany({
      where: { userId: user?.id },
      include: { Role: true },
    });

    return roles.map((role) => ({
      id: role.id,
      userId: role.userId,
      roleId: role.roleId,
      expiry: role.expiry,
      name: role.Role.name,
      xrefId: role.xrefId,
      createdAt: role.createdAt,
      createdBy: role.createdBy,
    }));
  }

  async addRoles(uuid: UUID, roles: string[], prisma?: PrismaClientType) {
    if (!prisma) prisma = this.prisma;

    const getValidRoles = await prisma.role.findMany({
      where: { name: { in: roles, mode: 'insensitive' } },
    });
    if (getValidRoles.length < 1) return [];
    const user = await prisma.user.findUnique({
      where: { uuid },
    });
    if (!user) throw ERRORS.USER_NOT_FOUND;

    await prisma.userRole.createMany({
      data: getValidRoles.map((role) => ({
        userId: user.id,
        roleId: role.id,
      })),
      skipDuplicates: true,
    });

    await this.authClient.emit(EVENTS.INVALIDATE_ABILITY_CACHE, {
      userId: user.uuid,
      xrefId: null,
    });

    return this.listRoles(uuid, prisma);
  }

  async removeRoles(uuid: UUID, roles: string[], prisma?: PrismaClientType) {
    if (!prisma) prisma = this.prisma;
    const getValidRoles = await prisma.role.findMany({
      where: { name: { in: roles, mode: 'insensitive' } },
    });
    if (getValidRoles.length < 1) return this.listRoles(uuid);
    const user = await prisma.user.findUnique({
      where: { uuid },
    });
    if (!user) throw ERRORS.USER_NOT_FOUND;

    const roleIds = getValidRoles.map((role) => role.id);
    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id, roleId: { in: roleIds } },
    });

    await prisma.userRole.deleteMany({
      where: {
        userId: user.id,
        roleId: { in: roleIds },
      },
    });

    const xrefIds = [...new Set(userRoles.map((userRole) => userRole.xrefId))];
    await Promise.all(
      xrefIds.map((xrefId) =>
        this.authClient.emit(EVENTS.INVALIDATE_ABILITY_CACHE, {
          userId: user.uuid,
          xrefId,
        }),
      ),
    );

    return this.listRoles(uuid);
  }

  /**
   * Check if a user with the given email, phone, or wallet already exists
   * @param tx - Prisma transaction client
   * @param data - User data to check
   * @param excludeUserId - User ID to exclude from the check (for updates)
   */
  private async _checkExistingUser(
    tx: PrismaClientType,
    data: UserDataToValidate,
    excludeUserId?: number,
  ): Promise<void> {
    const whereClause = { deletedAt: null } as any;
    if (excludeUserId) {
      whereClause.id = { not: excludeUserId };
    }

    if (data.email) {
      const existingEmailUser = await tx.user.findFirst({
        where: { ...whereClause, email: data.email },
      });
      if (existingEmailUser) {
        throw ERRORS.USER_EMAIL_EXISTS;
      }
    }

    if (data.phone) {
      const existingPhoneUser = await tx.user.findFirst({
        where: { ...whereClause, phone: data.phone },
      });
      if (existingPhoneUser) {
        throw ERRORS.USER_PHONE_EXISTS;
      }
    }

    if (data.wallet) {
      const existingWalletUser = await tx.user.findFirst({
        where: { ...whereClause, wallet: data.wallet },
      });
      if (existingWalletUser) {
        throw ERRORS.USER_WALLET_EXISTS;
      }
    }

    // Case-insensitive username check
    if (data.username) {
      const usernameLower = data.username.toLowerCase();

      const existingUsernameUser = await tx.user.findFirst({
        where: { ...whereClause, usernameLower },
      });
      if (existingUsernameUser) {
        throw ERRORS.USERNAME_EXISTS;
      }
    }
  }

  /**
   * Check if a service ID is already used by another user
   */
  private async _checkExistingAuthService(
    tx: PrismaClientType,
    service: Service,
    serviceId: string,
    excludeUserId?: number,
  ): Promise<void> {
    const whereClause = { service, serviceId } as any;
    if (excludeUserId) {
      whereClause.userId = { not: excludeUserId };
    }

    const existingServiceAuth = await tx.auth.findFirst({
      where: whereClause,
    });

    if (existingServiceAuth) {
      switch (service) {
        case Service.EMAIL:
          throw ERRORS.AUTH_EMAIL_EXISTS;
        case Service.PHONE:
          throw ERRORS.AUTH_PHONE_EXISTS;
        case Service.WALLET:
          throw ERRORS.AUTH_WALLET_EXISTS;
        case Service.USERNAME:
          throw ERRORS.AUTH_USERNAME_EXISTS;
        default:
          throw RSE(
            'This service ID is already registered with another user.',
            'AUTH_SERVICE_ID_EXISTS',
            409,
          );
      }
    }
  }

  /**
   * Validate user data and authentication services before creating or updating
   */
  private async _validateUserData(
    tx: PrismaClientType,
    userData: UserDataToValidate,
    excludeUserId?: number,
  ): Promise<void> {
    // Check for existing users
    await this._checkExistingUser(tx, userData, excludeUserId);

    // Check for existing auth services
    if (userData.email) {
      await this._checkExistingAuthService(
        tx,
        Service.EMAIL,
        userData.email,
        excludeUserId,
      );
    }
    if (userData.phone) {
      await this._checkExistingAuthService(
        tx,
        Service.PHONE,
        userData.phone,
        excludeUserId,
      );
    }
    if (userData.wallet) {
      await this._checkExistingAuthService(
        tx,
        Service.WALLET,
        userData.wallet,
        excludeUserId,
      );
    }
    if (userData.username) {
      await this._checkExistingAuthService(
        tx,
        Service.USERNAME,
        userData.username,
        excludeUserId,
      );
    }
  }

  /**
   * Create authentication records for a user
   * @param tx - Prisma transaction client
   * @param userId - User ID
   * @param userData - User data containing email, phone, wallet
   */
  private async _createAuthRecords(
    tx: PrismaClientType,
    userId: number,
    userData: UserDataToValidate,
  ): Promise<void> {
    await Promise.all([
      this._createAuth(userId, Service.EMAIL, userData.email || null, tx),
      this._createAuth(userId, Service.PHONE, userData.phone || null, tx),
      this._createAuth(userId, Service.WALLET, userData.wallet || null, tx),
      this._createAuth(userId, Service.USERNAME, userData.username || null, tx),
    ]);
  }

  /**
   * Update authentication records for a user
   */
  private async _updateAuthRecords(
    tx: PrismaClientType,
    user: User,
    userData: UserDataToValidate,
  ): Promise<void> {
    await Promise.all([
      this._updateAuth(tx, user, Service.EMAIL, userData.email),
      this._updateAuth(tx, user, Service.PHONE, userData.phone),
      this._updateAuth(tx, user, Service.WALLET, userData.wallet),
      this._updateAuth(tx, user, Service.USERNAME, userData.username),
    ]);
  }

  /**
   * Find user by ID with deleted check
   */
  private async _findUserById(
    id: number,
    tx?: PrismaClientType,
  ): Promise<User> {
    const client = tx || this.prisma;
    const user = await client.user.findUnique({
      where: { id, deletedAt: null },
    });
    if (!user) throw ERRORS.USER_NOT_FOUND;
    return user;
  }

  /**
   * Find user by UUID with deleted check
   * @param uuid - User UUID
   * @param tx - Optional transaction client
   */
  private async _findUserByUuid(
    uuid: UUID,
    tx?: PrismaClientType,
  ): Promise<User> {
    const client = tx || this.prisma;
    const user = await client.user.findUnique({
      where: { uuid, deletedAt: null },
    });
    if (!user) throw ERRORS.USER_NOT_FOUND;
    return user;
  }

  // ===================== Project-Scoped Role Assignment APIs =====================

  async assignRoleInProject(uuid: string, dto: AssignRoleDto) {
    const user = await this.prisma.user.findUnique({ where: { uuid } });
    if (!user) throw ERRORS.USER_NOT_FOUND;
    const { name, xrefId, expiry } = dto;
    const role = await this.prisma.role.findUnique({
      where: { name },
    });
    if (!role) throw RSE('Role does not exist!', 'ROLE_NOEXIST', 404);

    const data = this.prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
        xrefId,
        expiry: expiry ? new Date(expiry) : null,
      },
      include: { Role: true },
    });
    await this.authClient.emit(EVENTS.INVALIDATE_ABILITY_CACHE, {
      userId: user.uuid,
      xrefId,
    });
    return data;
  }

  async listRolesInProject(uuid: string, xrefId: string) {
    const user = await this.prisma.user.findUnique({ where: { uuid } });
    if (!user) throw ERRORS.USER_NOT_FOUND;

    return this.prisma.userRole.findMany({
      where: { userId: user.id, xrefId },
      include: { Role: true },
    });
  }

  async removeRoleInProject(uuid: string, xrefId: string, name: string) {
    const user = await this.prisma.user.findUnique({ where: { uuid } });
    if (!user) throw ERRORS.USER_NOT_FOUND;

    const role = await this.prisma.role.findUnique({
      where: { name },
    });
    if (!role) throw RSE('Role does not exist!', 'ROLE_NOEXIST', 404);

    const assignment = await this.prisma.userRole.findFirst({
      where: { userId: user.id, roleId: role.id, xrefId },
    });
    if (!assignment)
      throw RSE('Role assignment does not exist!', 'USERROLE_NOEXIST', 404);

    await this.prisma.userRole.delete({ where: { id: assignment.id } });

    await this.authClient.emit(EVENTS.INVALIDATE_ABILITY_CACHE, {
      userId: user.uuid,
      xrefId,
    });

    return { success: true };
  }

  async updateRoleAssignmentInProject(
    uuid: string,
    xrefId: string,
    name: string,
    dto: UpdateRoleAssignmentDto,
  ) {
    const user = await this.prisma.user.findUnique({ where: { uuid } });
    if (!user) throw ERRORS.USER_NOT_FOUND;

    const role = await this.prisma.role.findUnique({
      where: { name },
    });
    if (!role) throw RSE('Role does not exist!', 'ROLE_NOEXIST', 404);

    const assignment = await this.prisma.userRole.findFirst({
      where: { userId: user.id, roleId: role.id, xrefId },
    });
    if (!assignment)
      throw RSE('Role assignment does not exist!', 'USERROLE_NOEXIST', 404);

    const newRole = await this.prisma.role.findUnique({
      where: { name: dto.name },
    });
    if (!newRole) throw RSE('New role does not exist!', 'ROLE_NOEXIST', 404);

    const updated = await this.prisma.userRole.update({
      where: { id: assignment.id },
      data: {
        expiry: dto.expiry ? new Date(dto.expiry) : null,
        roleId: newRole.id,
      },
      include: { Role: true },
    });

    await this.authClient.emit(EVENTS.INVALIDATE_ABILITY_CACHE, {
      userId: user.uuid,
      xrefId,
    });

    return updated;
  }

  // ===================== User Role Query APIs =====================

  async listActiveRoles(uuid: string) {
    const user = await this.prisma.user.findUnique({ where: { uuid } });
    if (!user) throw ERRORS.USER_NOT_FOUND;

    return this.prisma.userRole.findMany({
      where: {
        userId: user.id,
        OR: [{ expiry: null }, { expiry: { gt: new Date() } }],
      },
      include: { Role: { include: { Permission: true } } },
    });
  }

  async listAllPermissions(uuid: string) {
    const user = await this.prisma.user.findUnique({ where: { uuid } });
    if (!user) throw ERRORS.USER_NOT_FOUND;

    const assignments = await this.prisma.userRole.findMany({
      where: {
        userId: user.id,
        OR: [{ expiry: null }, { expiry: { gt: new Date() } }],
      },
      select: {
        xrefId: true,
        Role: { include: { Permission: true } },
      },
    });

    const rolesByProject: Record<string, string[]> = {};
    for (const assignment of assignments) {
      const project = assignment.xrefId ?? '__global__';
      if (!rolesByProject[project]) rolesByProject[project] = [];
      rolesByProject[project].push(assignment.Role.name);
    }

    const permissions = this._dedupePermissions(
      assignments.flatMap((a) => a.Role.Permission),
    );

    return { permissions, rolesByProject };
  }

  async listPermissionsInProject(uuid: string, xrefId: string) {
    const user = await this.prisma.user.findUnique({ where: { uuid } });
    if (!user) throw ERRORS.USER_NOT_FOUND;

    const assignments = await this.prisma.userRole.findMany({
      where: {
        userId: user.id,
        xrefId,
        OR: [{ expiry: null }, { expiry: { gt: new Date() } }],
      },
      include: { Role: { include: { Permission: true } } },
    });

    const permissions = assignments.flatMap((a) => a.Role.Permission);
    return this._dedupePermissions(permissions);
  }

  // ===================== Project-Centric Query APIs =====================
  async listUsersInProject(
    xrefId: string,
    name?: string,
    includeExpired?: boolean,
  ) {
    const where: Prisma.UserRoleWhereInput = {
      xrefId,
      ...(name
        ? { Role: { name: { contains: name, mode: 'insensitive' } } }
        : {}),
      ...(!includeExpired
        ? { OR: [{ expiry: null }, { expiry: { gt: new Date() } }] }
        : {}),
    };

    const assignments = await this.prisma.userRole.findMany({
      where,
      include: {
        User: true,
        Role: true,
      },
    });

    const usersMap = new Map<string, { user: User; roles: string[] }>();
    for (const assignment of assignments) {
      const uuid = assignment.User.uuid;
      if (!usersMap.has(uuid)) {
        usersMap.set(uuid, { user: assignment.User, roles: [] });
      }
      usersMap.get(uuid)?.roles.push(assignment.Role.name);
    }

    return Array.from(usersMap.values()).map(({ user, roles }) => ({
      ...user,
      roles,
    }));
  }

  async listUsersByRoleInProject(
    xrefId: string,
    name: string,
    includeExpired?: boolean,
  ) {
    const where: Prisma.UserRoleWhereInput = {
      xrefId,
      Role: { name },
      ...(!includeExpired
        ? { OR: [{ expiry: null }, { expiry: { gt: new Date() } }] }
        : {}),
    };

    const assignments = await this.prisma.userRole.findMany({
      where,
      include: { User: true },
    });

    return assignments.map((a) => a.User);
  }

  private _dedupePermissions(
    perms: {
      action: string;
      subject: string;
      inverted: boolean;
      conditions: any;
      reason: string | null;
    }[],
  ) {
    const map = new Map<string, object>();
    for (const perm of perms) {
      const key = `${perm.action}:${perm.subject}:${perm.inverted}`;
      if (!map.has(key)) {
        const rule: any = { action: perm.action, subject: perm.subject };
        if (perm.inverted) rule.inverted = true;
        if (perm.conditions) rule.conditions = perm.conditions;
        if (perm.reason) rule.reason = perm.reason;
        map.set(key, rule);
      }
    }
    return Array.from(map.values());
  }

  async getUserAbilitiesInProject(uuid: string, xrefId: string) {
    const user = await this.prisma.user.findUnique({ where: { uuid } });
    if (!user) throw ERRORS.USER_NOT_FOUND;

    const assignments = await this.prisma.userRole.findMany({
      where: {
        userId: user.id,
        OR: [{ xrefId }, { xrefId: null }],
        AND: { OR: [{ expiry: null }, { expiry: { gt: new Date() } }] },
      },
      include: { Role: { include: { Permission: true } } },
    });

    const rules = this._dedupePermissions(
      assignments.flatMap((a) => a.Role.Permission),
    );

    return { rules };
  }
}
