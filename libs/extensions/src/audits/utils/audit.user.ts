import { AuditOperation, Prisma, PrismaClient } from '@prisma/client';
import { auditTransact } from './audit-transaction';

export const AuditUser = {
  create: (prisma: PrismaClient, userId: number, data: Prisma.UserCreateArgs) =>
    auditTransact(prisma, {
      operation: AuditOperation.CREATE,
      rowIdKey: 'id',
      tableName: 'tbl_users',
      userId,
      args: data,
      operationFunction(tx, args) {
        return tx.user.create(args);
      },
    }),

  update: (prisma: PrismaClient, userId: number, data: Prisma.UserUpdateArgs) =>
    auditTransact(prisma, {
      operation: AuditOperation.UPDATE,
      rowIdKey: 'id',
      tableName: 'tbl_users',
      userId,
      args: data,
      operationFunction(tx, args) {
        return tx.user.update(args);
      },
    }),
};
