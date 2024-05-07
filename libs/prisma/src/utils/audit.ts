import { Audit, AuditOperation, Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

type AuditTransactOptions<T> = {
  userId: number;
  operation: AuditOperation;
  tableName: string;
  rowIdKey: string | number; // Add rowId to options
  operationFunction: (
    tx: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    args: T,
  ) => any;
  args: T | any;
};

export async function auditTransact<T = Record<string, unknown> | any>(
  prisma: PrismaClient,
  options: AuditTransactOptions<T>,
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Perform the operation
      const operationResult = await options.operationFunction(tx, options.args);

      // Check if operationResult is an array
      if (Array.isArray(operationResult)) {
        // Handle multiple records
        const audits = operationResult.map(async (record) => {
          const currentAudit = await tx.audit.findFirst({
            where: {
              tableName: options.tableName,
              rowId: record[options.rowIdKey],
            },
            orderBy: { timestamp: 'desc' },
          });

          const currentVersion = currentAudit ? currentAudit.version : 0;

          // @ts-ignore
          const audit: Audit = {
            tableName: options.tableName,
            operation: options.operation,
            fieldName: Object.keys(
              (options.args.data || options.args) as JSON,
            ).join(', '),
            timestamp: new Date(),
            updatedBy: options.userId,
            value: JSON.stringify(options.args),
            version: currentVersion + 1,
            rowId: record[options.rowIdKey],
          };

          return prisma.audit.create({ data: audit });
        });

        await Promise.all(audits);
      } else {
        // Handle single record
        const currentAudit = await prisma.audit.findFirst({
          where: {
            tableName: options.tableName,
            rowId: operationResult[options.rowIdKey],
          },
          orderBy: { timestamp: 'desc' },
        });

        const currentVersion = currentAudit ? currentAudit.version : 0;

        // @ts-ignore

        const audit: Audit = {
          tableName: options.tableName,
          operation: options.operation,
          fieldName: Object.keys(
            options.args.data || (options.args as JSON),
          ).join(', '),
          timestamp: new Date(),
          updatedBy: options.userId,
          value: JSON.stringify(options.args.data || options.args),
          version: currentVersion + 1,
          rowId: operationResult[options.rowIdKey],
        };

        await prisma.audit.create({ data: audit });
      }

      return operationResult;
    });

    return result;
  } catch (error) {
    console.error('Error in auditTransact:', error);
    throw error; // re-throw the error after logging
  }
}

export type AuditTransactFunctionType<T> = (
  prisma: PrismaClient,
  userId: number,
  data: T,
) => ReturnType<typeof auditTransact>;

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
