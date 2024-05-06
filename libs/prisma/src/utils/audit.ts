import { Audit, AuditOperation, Prisma, PrismaClient } from '@prisma/client';

type AuditTransactOptions = {
  userId: number;
  operation: AuditOperation;
  tableName: string;
};

export function auditTransact(
  prisma: PrismaClient | any,
  options: AuditTransactOptions,
) {
  return async function <T>(operation: any, args: T) {
    const result = await prisma.$transaction(async () => {
      // Perform the operation
      const operationResult = await operation(args);

      // Save audit information
      // @ts-ignore
      const audit: Audit = {
        tableName: options.tableName,
        operation: options.operation,
        fieldName: Object.keys(args as object).join(', '),
        timestamp: new Date(),
        updatedBy: options.userId,
        value: JSON.stringify(operationResult),
        version: 1,
      };

      await prisma.audit.create({ data: audit });

      return operationResult;
    });

    return result;
  };
}

export type AuditTransactFunctionType<T> = (
  prisma: PrismaClient,
  userId: number,
  data: T,
) => ReturnType<typeof auditTransact>;

export const UserPrismaWithAudit = {
  create: (prisma: PrismaClient, userId: number, data: Prisma.UserCreateArgs) =>
    auditTransact(prisma, {
      userId,
      operation: AuditOperation.CREATE,
      tableName: 'tbl_users',
    })(prisma.user.create, data),
  createMany: <T = any>(prisma: PrismaClient, userId: number, data: T) =>
    auditTransact(prisma, {
      userId,
      operation: AuditOperation.CREATE,
      tableName: 'tbl_users',
    })(prisma.user.createMany, data),

  update: <T = any>(prisma: PrismaClient, userId: number, data: T) =>
    auditTransact(prisma, {
      userId,
      operation: AuditOperation.UPDATE,
      tableName: 'tbl_users',
    })(prisma.user.update, data),

  delete: <T = any>(prisma: PrismaClient, userId: number) =>
    auditTransact(prisma, {
      userId,
      operation: AuditOperation.DELETE,
      tableName: 'tbl_users',
    }),
  deleteMany: <T = any>(prisma: PrismaClient, userId: number, data: T) =>
    auditTransact(prisma, {
      userId,
      operation: AuditOperation.DELETE,
      tableName: 'tbl_users',
    })(prisma.user.deleteMany, data),
};

export const AuthWithAudit = {
  create: (prisma: PrismaClient, userId: number, data: Prisma.AuthCreateArgs) =>
    auditTransact(prisma, {
      userId,
      operation: AuditOperation.CREATE,
      tableName: 'tbl_auth',
    })(prisma.auth.create, data),
  createMany: (
    prisma: PrismaClient,
    userId: number,
    data: Prisma.AuthCreateManyArgs,
  ) =>
    auditTransact(prisma, {
      userId,
      operation: AuditOperation.CREATE,
      tableName: 'tbl_auth',
    })(prisma.auth.createMany, data),

  update: (prisma: PrismaClient, userId: number, data: Prisma.AuthUpdateArgs) =>
    auditTransact(prisma, {
      userId,
      operation: AuditOperation.UPDATE,
      tableName: 'tbl_auth',
    })(prisma.auth.update, data),

  // TODO:ADD these actions
  delete: (prisma: PrismaClient, userId: number) =>
    auditTransact(prisma, {
      userId,
      operation: AuditOperation.DELETE,
      tableName: 'tbl_auth',
    }),
  deleteMany: <T = any>(prisma: PrismaClient, userId: number, data: T) =>
    auditTransact(prisma, {
      userId,
      operation: AuditOperation.DELETE,
      tableName: 'tbl_auth',
    })(prisma.auth.deleteMany, data),
};
