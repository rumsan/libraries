import { Module } from '@nestjs/common';
import { PrismaModule } from '@rumsan/prisma';
import { AbilityModule } from '../ability/ability.module';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

@Module({
  imports: [PrismaModule, AbilityModule.forRoot()],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
