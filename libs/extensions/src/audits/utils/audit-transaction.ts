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
