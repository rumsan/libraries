import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

const softDelete = async function <M, A>(
  this: M,
  where: Prisma.Args<M, 'update'>['where'],
  updatedBy: string,
): Promise<Prisma.Result<M, A, 'update'>> {
  const context = Prisma.getExtensionContext(this);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (context as any).update({
    where,
    data: {
      deletedAt: new Date(),
      updatedBy,
    },
  });

  return result;
};

const exists = async function <M>(
  this: M,
  where: Prisma.Args<M, 'findFirst'>['where'],
): Promise<boolean> {
  // Get the current model at runtime
  const context = Prisma.getExtensionContext(this);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (context as any).findFirst({ where });
  return result !== null;
};

const isDeleted = async function <M>(
  this: M,
  where: Prisma.Args<M, 'findUnique'>['where'],
): Promise<boolean> {
  const context = Prisma.getExtensionContext(this);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (context as any).findUnique({ where });

  return !!result.deletedAt;
};

export const PrismaExtendedClient = (prismaClient: PrismaClient) =>
  prismaClient.$extends({
    model: {
      $allModels: {
        isDeleted,
        exists,
        softDelete,
      },
    },
  });

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  public readonly rsclient = PrismaExtendedClient(this);

  constructor() {
    super();

    new Proxy(this, {
      get: (target, property) =>
        Reflect.get(
          property in this.rsclient ? this.rsclient : target,
          property,
        ),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
