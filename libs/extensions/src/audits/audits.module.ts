import { Module } from '@nestjs/common';
import { PrismaModule } from '@rumsan/prisma';
import { AuditController } from './audits.controller';
import { AuditService } from './audits.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
