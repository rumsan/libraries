import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from '@rumsan/prisma';

@Module({
  controllers: [],
  providers: [PrismaService],
  exports: [],
  imports: [PrismaModule],
})
export class BeneficiaryModule {}
