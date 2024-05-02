import { Audit, AuditOperation, PrismaClient } from '@prisma/client';

type AuditTransactOptions = {
  userId: string;
  operation: AuditOperation;
  tableName: string;
};

export function auditTransact(
  prisma: PrismaClient,
  options: AuditTransactOptions,
) {
  return async function <T>(operation: any, args: T) {
    const result = await prisma.$transaction(async () => {
      // Perform the operation
      const operationResult = await operation(args);
      console.log('operationResult', operationResult);

      // Save audit information
      const audit: Audit = {
        tableName: options.tableName,
        operation: options.operation,
        fieldName: Object.keys(args as object).join(', '),
        timestamp: new Date(),
        updatedBy: options.userId,
        value: JSON.stringify(operationResult),
        version: 1,
        id: 1,
      };

      await prisma.audit.create({ data: audit });

      return operationResult;
    });

    return result;
  };
}
