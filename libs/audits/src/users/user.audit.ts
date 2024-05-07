import { AuditOperation, Prisma, PrismaClient } from '@prisma/client';
import { auditTransact } from '../utils/audit-transaction';

export const UserPrismaWithAudit = {
  create: (
    prisma: PrismaClient,
    userId: number,
    payload: Prisma.UserCreateArgs,
  ) =>
    auditTransact(prisma, {
      userId,
      operation: AuditOperation.CREATE,
      tableName: 'tbl_users',
      rowIdKey: 'id',
      args: payload,
      operationFunction: (tx, args) => tx.user.create(args),
    }),
  // createMany: <T = any>(prisma: PrismaClient, userId: number, data: T) =>
  //   auditTransact(prisma, {
  //     userId,
  //     operation: AuditOperation.CREATE,
  //     tableName: 'tbl_users',
  //     rowIdKey: 'id',
  //   })(prisma.user.createMany, data),

  update: (prisma: PrismaClient, userId: number, data: Prisma.UserUpdateArgs) =>
    auditTransact(prisma, {
      userId,
      operation: AuditOperation.UPDATE,
      tableName: 'tbl_users',
      rowIdKey: 'id',
      args: data,
      operationFunction: (tx, b) => tx.user.update(b),
    }),

  // delete: <T = any>(prisma: PrismaClient, userId: number) =>
  //   auditTransact(prisma, {
  //     userId,
  //     operation: AuditOperation.DELETE,
  //     tableName: 'tbl_users',
  //     rowIdKey: 'id',
  //   }),
  // deleteMany: <T = any>(prisma: PrismaClient, userId: number, data: T) =>
  //   auditTransact(prisma, {
  //     userId,
  //     operation: AuditOperation.DELETE,
  //     tableName: 'tbl_users',
  //     rowIdKey: 'id',
  //   })(prisma.user.deleteMany, data),
};

// export const AuthWithAudit = {
//   create: (prisma: PrismaClient, userId: number, data: Prisma.AuthCreateArgs) =>
//     auditTransact(prisma, {
//       userId,
//       operation: AuditOperation.CREATE,
//       tableName: 'tbl_auth',
//       rowIdKey: 'id',
//     })(prisma.auth.create, data),
//   createMany: (
//     prisma: PrismaClient,
//     userId: number,
//     data: Prisma.AuthCreateManyArgs,
//   ) =>
//     auditTransact(prisma, {
//       userId,
//       operation: AuditOperation.CREATE,
//       tableName: 'tbl_auth',
//       rowIdKey: 'id',
//     })(prisma.auth.createMany, data),

//   update: (prisma: PrismaClient, userId: number, data: Prisma.AuthUpdateArgs) =>
//     auditTransact(prisma, {
//       userId,
//       operation: AuditOperation.UPDATE,
//       tableName: 'tbl_auth',
//       rowIdKey: 'id',
//     })(prisma.auth.update, data),

//   // TODO:ADD these actions
//   delete: (prisma: PrismaClient, userId: number) =>
//     auditTransact(prisma, {
//       userId,
//       operation: AuditOperation.DELETE,
//       tableName: 'tbl_auth',
//       rowIdKey: 'id',
//     }),
//   deleteMany: <T = any>(prisma: PrismaClient, userId: number, data: T) =>
//     auditTransact(prisma, {
//       userId,
//       operation: AuditOperation.DELETE,
//       tableName: 'tbl_auth',
//       rowIdKey: 'id',
//     })(prisma.auth.deleteMany, data),
// };
