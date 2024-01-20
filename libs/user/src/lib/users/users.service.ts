import { Injectable } from '@nestjs/common';
import { PaginatorTypes, paginator } from '@nodeteam/nestjs-prisma-pagination';
import { Prisma, PrismaClient, Service, User } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { PrismaService } from '@rumsan/prisma';
import { AuthsService } from '../auths/auths.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { UserListDto } from './dto/users-list.dto';

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 20 });
@Injectable()
export class UsersService {
  private rsprisma;
  constructor(
    protected prisma: PrismaService,
    public authService: AuthsService,
  ) {
    this.rsprisma = this.prisma.rsclient;
  }

  async create(
    dto: CreateUserDto,
    { callback } = {
      callback: (
        err: Error | null,
        tx: Omit<
          PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
          | '$on'
          | '$connect'
          | '$disconnect'
          | '$use'
          | '$transaction'
          | '$extends'
        >,
        user: User | null,
      ) => {},
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      try {
        const user = await tx.user.create({
          data: {
            ...dto,
          },
        });

        if (user.email)
          await tx.auth.create({
            data: {
              userId: user.id,
              service: Service.EMAIL,
              serviceId: user.email,
            },
          });

        if (user.phone)
          await tx.auth.create({
            data: {
              userId: user.id,
              service: Service.PHONE,
              serviceId: user.phone,
            },
          });

        if (user.wallet)
          await tx.auth.create({
            data: {
              userId: user.id,
              service: Service.WALLET,
              serviceId: user.wallet,
            },
          });

        if (callback) await callback(null, tx, user);
        return user;
      } catch (err: any) {
        if (callback) await callback(err, tx, null);
        throw err;
      }
    });
  }

  async updateById(userId: number, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
        deletedAt: null,
      },
      data: { ...dto },
    });
    return user;
  }

  async update(uuid: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: {
        uuid,
        deletedAt: null,
      },
      data: { ...dto },
    });
    return user;
  }

  async list(dto: UserListDto): Promise<PaginatorTypes.PaginatedResult<User>> {
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

  get(uuid: string) {
    return this.prisma.user.findUnique({ where: { uuid, deletedAt: null } });
  }

  async delete(uuid: string) {
    try {
      const user = await this.rsprisma.user.softDelete({ uuid });
      return user;
    } catch (err) {
      throw new Error('rs-user: User not found or deletion not permitted.');
    }
  }
}
