import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { createId } from '@paralleldrive/cuid2';
import { Prisma, PrismaClient, Service } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import {
  CreateUserDto,
  ListUserDto,
  UpdateUserDto,
} from '@rumsan/extensions/dtos';
import { paginator, PaginatorTypes, PrismaService } from '@rumsan/prisma';
import { tRC, User, UserRole } from '@rumsan/sdk/types';
import { CUI } from '../auths/interfaces/current-user.interface';
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
    return this.prisma.$transaction(async (tx) => {
      try {
        const { roles, details, ...data } = dto;
        const userPayload: User = { ...data, cuid: createId() };

        const user: User = (await tx.user.create({
          data: userPayload,
        })) as User;

        if (details) {
          await tx.userDetails.create({
            data: { cuid: user.cuid, ...details },
          });
        }

        if (roles?.length) {
          await this.addRoles(user.cuid as string, roles, tx);
        }

        await Promise.all([
          this._createAuth(
            user.id as number,
            Service.EMAIL,
            user.email as string,
            tx,
          ),
          this._createAuth(
            user.id as number,
            Service.PHONE,
            user.phone as string,
            tx,
          ),
          this._createAuth(
            user.id as number,
            Service.WALLET,
            user.wallet as string,
            tx,
          ),
        ]);

        if (callback) {
          await callback(null, tx, user);
        }

        user.details = details;

        this.eventEmitter.emit(EVENTS.USER_CREATED, {
          user,
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
      await prisma.auth.create({
        data: { userId, service, serviceId },
      });
    }
  }

  async list(dto: ListUserDto): Promise<PaginatorTypes.PaginatedResult<User>> {
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    orderBy[dto.sort] = dto.order;
    return paginate(
      this.prisma.user,
      {
        where: {
          deletedAt: null,
        },
        include: {
          details: true,
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
    return this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      include: {
        details: true,
        UserRole: {
          include: {
            Role: true,
          },
        },
      },
    });
  }

  async get(cuid: string, prisma?: PrismaClientType) {
    if (!prisma) prisma = this.prisma;
    const user = await prisma.user.findUnique({
      where: { cuid, deletedAt: null },
      include: {
        UserRole: {
          include: {
            Role: true,
          },
        },
        details: true,
      },
    });
    return user;
  }

  async update(cuid: string, dto: UpdateUserDto) {
    return this.prisma.$transaction(async (tx) => {
      const user = (await this.prisma.user.findUnique({
        where: { cuid, deletedAt: null },
      })) as User;

      if (!user) throw ERRORS.USER_NOT_FOUND;

      const { details, ...data } = dto;

      // Update user details
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data,
        include: {
          details: true,
        },
      });

      if (details) {
        await tx.userDetails.update({
          data: { cuid: user.cuid, ...details },
          where: { cuid: user.cuid },
        });
      }

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
          data: { userId: user.id as number, service, serviceId: newServiceId },
        });
      }
    }
  }

  async updateMe(userId: number, dto: UpdateUserDto, rdetails: tRC) {
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
        include: {
          details: true,
        },
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

  async processVerificationChallenge(challenge: string, rdetails: tRC) {
    const payload = decryptChallenge(getSecret(), challenge, 1200);

    if (!payload.address) {
      throw new Error('Invalid challenge');
    }

    if (payload.ip !== rdetails.ip) {
      // IP in challenge doesn't match the incoming IP
      throw new Error('IP mismatch');
    }

    const user = (await this.prisma.user.findUnique({
      where: { id: payload.data['userId'], deletedAt: null },
    })) as User;

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
        include: {
          details: true,
        },
        data,
      });
    });
  }

  async delete(cuid: string, cui: CUI) {
    try {
      const user = await this.rsprisma.user.softDelete(
        { cuid },
        cui.cuid,
        cui.sessionId,
      );
      return user;
    } catch (err) {
      throw new Error('rs-user: User not found or deletion not permitted.');
    }
  }

  async listRoles(
    cuid: string,
    prisma?: PrismaClientType,
  ): Promise<UserRole[]> {
    if (!prisma) prisma = this.prisma;
    const user = await this.get(cuid, prisma);
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
      createdAt: role.createdAt,
      createdBy: role.createdBy,
    }));
  }

  async addRoles(cuid: string, roles: string[], prisma?: PrismaClientType) {
    if (!prisma) prisma = this.prisma;

    const getValidRoles = await prisma.role.findMany({
      where: { name: { in: roles, mode: 'insensitive' } },
    });
    if (getValidRoles.length < 1) return [];
    const user = await prisma.user.findUnique({
      where: { cuid },
    });
    if (!user) throw ERRORS.USER_NOT_FOUND;

    await prisma.userRole.createMany({
      data: getValidRoles.map((role) => ({
        userId: user.id,
        roleId: role.id,
      })),
      skipDuplicates: true,
    });
    return this.listRoles(cuid, prisma);
  }

  async removeRoles(cuid: string, roles: string[], prisma?: PrismaClientType) {
    if (!prisma) prisma = this.prisma;
    const getValidRoles = await prisma.role.findMany({
      where: { name: { in: roles, mode: 'insensitive' } },
    });
    if (getValidRoles.length < 1) this.listRoles(cuid);
    const user = await prisma.user.findUnique({
      where: { cuid },
    });
    if (!user) throw ERRORS.USER_NOT_FOUND;

    await prisma.userRole.deleteMany({
      where: {
        userId: user.id,
        roleId: { in: getValidRoles.map((role) => role.id) },
      },
    });
    return this.listRoles(cuid);
  }
}
