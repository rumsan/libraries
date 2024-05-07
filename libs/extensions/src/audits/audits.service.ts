import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginatorTypes, PrismaService, paginator } from '@rumsan/prisma';

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 20 });

@Injectable()
export class AuditService {
  private rsprisma;
  constructor(protected prisma: PrismaService) {
    this.rsprisma = this.prisma.rsclient;
  }

  async listAudits() {
    const include: Prisma.AuditInclude = {
      user: {
        select: {
          name: true,
          id: true,
          wallet: true,
        },
      },
    };
    return paginate(
      this.rsprisma.audit,
      {
        include,
      },
      {
        page: 1,
        perPage: 20,
      },
    );
  }

  async listGroupedAudits() {
    // 1. Audit Trail
    const auditTrail = await this.rsprisma.audit.findMany();

    // 2. User Activity
    const userActivity = await this.rsprisma.audit.groupBy({
      by: ['updatedBy'],
      _count: true,
    });

    // 3. Table Activity
    const tableActivity = await this.rsprisma.audit.groupBy({
      by: ['tableName'],
      _count: true,
    });

    // 4. Record History
    // Assuming tableName and rowId are provided
    const recordHistory = await this.rsprisma.audit.findMany({
      where: {
        tableName: 'yourTableName',
        rowId: 6,
      },
      orderBy: {
        timestamp: Prisma.SortOrder.desc,
      },
    });

    // 5. Operation Summary
    const operationSummary = await this.rsprisma.audit.groupBy({
      by: ['operation'],
      _count: true,
    });

    // 6. Field Changes
    // Assuming tableName and fieldName are provided
    const fieldChanges = await this.rsprisma.audit.findMany({
      where: {
        tableName: 'tbl_beneficiaries',
        fieldName: 'name',
      },
      orderBy: {
        timestamp: Prisma.SortOrder.desc,
      },
    });

    // 7. Time-Based Reports
    // Assuming startDate and endDate are provided
    const timeBasedReports = await this.rsprisma.audit.findMany({
      where: {
        timestamp: {
          // gte: new Date.now() - 86400000,
          // lte: new Date.now(),
        },
      },
      orderBy: {
        timestamp: Prisma.SortOrder.desc,
      },
    });

    // 8. Version History
    // Assuming rowId is provided
    const versionHistory = await this.rsprisma.audit.findMany({
      where: {
        rowId: 6,
      },
      orderBy: {
        version: Prisma.SortOrder.desc,
      },
    });

    return {
      auditTrail,
      userActivity,
      tableActivity,
      recordHistory,
      operationSummary,
      fieldChanges,
      timeBasedReports,
      versionHistory,
    };
  }
}
