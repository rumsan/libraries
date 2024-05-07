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
}
