import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaginatorTypes, paginator } from '@nodeteam/nestjs-prisma-pagination';
import { Prisma, PrismaClient, Service, User } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { TRequestDetails } from '@rumsan/core';
import { PrismaService } from '@rumsan/prisma';
import { CreateUserDto, ListUserDto, UpdateUserDto } from '@rumsan/sdk/dtos';
import { createChallenge, decryptChallenge } from '@rumsan/sdk/utils';
import { UUID } from 'crypto';
import { ERRORS } from '../constants';
import { getSecret } from '../utils/configUtils';
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
        const user = await tx.user.create({
          data: { ...dto },
        });

        await Promise.all([
          this._createAuth(tx, user.id, Service.EMAIL, user.email),
          this._createAuth(tx, user.id, Service.PHONE, user.phone),
          this._createAuth(tx, user.id, Service.WALLET, user.wallet),
        ]);

        if (callback) {
          await callback(null, tx, user);
        }

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
    tx: PrismaClientType,
    userId: number,
    service: Service,
    serviceId: string | null,
  ): Promise<void> {
    if (serviceId) {
      await tx.auth.create({
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
    });
  }

  async get(uuid: string, throwIfNotFound = false) {
    const user = await this.prisma.user.findUnique({
      where: { uuid, deletedAt: null },
    });
    if (!user && throwIfNotFound) throw new Error('User not found.');
    return user;
  }

  async update(uuid: string, dto: UpdateUserDto) {
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

  async updateMe(
    userId: number,
    dto: UpdateUserDto,
    rdetails: TRequestDetails,
  ) {
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

  async processVerificationChallenge(
    challenge: string,
    rdetails: TRequestDetails,
  ) {
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

  async delete(uuid: string) {
    try {
      const user = await this.rsprisma.user.softDelete({ uuid });
      return user;
    } catch (err) {
      throw new Error('rs-user: User not found or deletion not permitted.');
    }
  }

  async listRoles(uuid: UUID) {
    const user = await this.get(uuid, true);
    return this.prisma.userRole.findMany({
      where: { userId: user?.id },
    });
  }
}
