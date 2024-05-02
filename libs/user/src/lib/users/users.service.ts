import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AuditOperation,
  Prisma,
  PrismaClient,
  Service,
  User,
} from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import {
  CreateUserDto,
  ListUserDto,
  UpdateUserDto,
} from '@rumsan/extensions/dtos';
import {
  PaginatorTypes,
  PrismaService,
  auditTransact,
  paginator,
} from '@rumsan/prisma';
import { Request, UserRole } from '@rumsan/sdk/types';
import { UUID } from 'crypto';
import { ERRORS, EVENTS } from '../constants';
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
    private eventEmitter: EventEmitter2,
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
    const userAudit = auditTransact(this.prisma as PrismaClient, {
      operation: AuditOperation.CREATE,
      tableName: 'User',
      userId: '1',
    });
    return userAudit(this.prisma.$transaction, async (tx) => {
      try {
        const { roles, ...data } = dto;
        const user = await tx.user.create({
          data,
        });

        if (roles?.length) {
          await this.addRoles(user.uuid as UUID, roles, tx);
        }
        // await this.addRoles(user.uuid as UUID, dto.roles, tx);

        await Promise.all([
          this._createAuth(user.id, Service.EMAIL, user.email, tx),
          this._createAuth(user.id, Service.PHONE, user.phone, tx),
          this._createAuth(user.id, Service.WALLET, user.wallet, tx),
        ]);

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
    // return this.prisma.$transaction(async (tx) => {
    //   try {
    //     const { roles, ...data } = dto;
    //     const user = await tx.user.create({
    //       data,
    //     });

    //     if (roles?.length) {
    //       await this.addRoles(user.uuid as UUID, roles, tx);
    //     }
    //     // await this.addRoles(user.uuid as UUID, dto.roles, tx);

    //     await Promise.all([
    //       this._createAuth(user.id, Service.EMAIL, user.email, tx),
    //       this._createAuth(user.id, Service.PHONE, user.phone, tx),
    //       this._createAuth(user.id, Service.WALLET, user.wallet, tx),
    //     ]);

    //     if (callback) {
    //       await callback(null, tx, user);
    //     }
    //     this.eventEmitter.emit(EVENTS.USER_CREATED, {
    //       address: user.email,
    //     });
    //     return user;
    //   } catch (error: any) {
    //     if (callback) {
    //       await callback(error, tx, null);
    //     }
    //     throw error;
    //   }
    // });
  }

  private async _createAuth(
    userId: number,
    service: Service,
    serviceId: string | null,
    prisma: PrismaClientType,
  ): Promise<void> {
    if (!prisma) prisma = this.prisma;
    if (serviceId) {
      await prisma.auth.create({
        data: { userId, service, serviceId },
      });
    }
  }

  async list(dto: ListUserDto): Promise<PaginatorTypes.PaginatedResult<User>> {
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    orderBy[dto.sort] = dto.order;
    return paginate(
      this.rsprisma.user,
      {
        where: {
          deletedAt: null,
        },
        orderBy,
      },
      {
        page: dto.page,
        perPage: dto.perPage,
      },
    );
  }

  getById(userId: number) {
    const userAudit = auditTransact(this.prisma as PrismaClient, {
      operation: AuditOperation.CREATE,
      tableName: 'User',
      userId: '1',
    });

    return userAudit(this.prisma.user.findUnique, {
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
      const user = await this.prisma.user.findUnique({
        where: { uuid, deletedAt: null },
      });

      if (!user) throw ERRORS.USER_NOT_FOUND;

      // Update user details
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { ...dto },
      });

      // Update authentication details only if corresponding DTO field is provided
      await this._updateAuth(tx, user, Service.EMAIL, dto.email);
      await this._updateAuth(tx, user, Service.PHONE, dto.phone);
      await this._updateAuth(tx, user, Service.WALLET, dto.wallet);

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
      const user = await this.prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
      });

      if (!user) {
        throw new Error('User not found.');
      }

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
      throw new Error('Invalid challenge');
    }

    if (payload.ip !== rdetails.ip) {
      // IP in challenge doesn't match the incoming IP
      throw new Error('IP mismatch');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.data['userId'], deletedAt: null },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const service = getServiceTypeByAddress(payload.address);
    if (!service) {
      throw new Error('Invalid service');
    }

    const data: { email?: string; phone?: string; wallet?: string } = {};
    if (service === Service.EMAIL) data.email = payload.address;
    if (service === Service.PHONE) data.phone = payload.address;
    if (service === Service.WALLET) data.wallet = payload.address;

    await this.prisma.$transaction(async (tx) => {
      await this._updateAuth(tx, user, service, payload.address);
      await tx.user.update({
        where: { id: user.id },
        data,
      });
    });
  }

  async delete(uuid: UUID) {
    try {
      const user = await this.rsprisma.user.softDelete({ uuid });
      return user;
    } catch (err) {
      throw new Error('rs-user: User not found or deletion not permitted.');
    }
  }

  async listRoles(uuid: UUID, prisma?: PrismaClientType): Promise<UserRole[]> {
    if (!prisma) prisma = this.prisma;
    const user = await this.get(uuid, prisma);
    if (!user) throw ERRORS.USER_NOT_FOUND;
    const roles = await this.rsprisma.userRole.findMany({
      where: { userId: user?.id },
      include: { Role: true },
    });

    return roles.map((role) => ({
      id: role.id,
      userId: role.userId,
      roleId: role.roleId,
      expiry: role.expiry,
      name: role.Role.name,
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
    return this.listRoles(uuid, prisma);
  }

  async removeRoles(uuid: UUID, roles: string[], prisma?: PrismaClientType) {
    if (!prisma) prisma = this.prisma;
    const getValidRoles = await prisma.role.findMany({
      where: { name: { in: roles, mode: 'insensitive' } },
    });
    if (getValidRoles.length < 1) this.listRoles(uuid);
    const user = await prisma.user.findUnique({
      where: { uuid },
    });
    if (!user) throw ERRORS.USER_NOT_FOUND;

    await prisma.userRole.deleteMany({
      where: {
        userId: user.id,
        roleId: { in: getValidRoles.map((role) => role.id) },
      },
    });
    return this.listRoles(uuid);
  }
}
