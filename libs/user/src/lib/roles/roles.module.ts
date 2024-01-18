import { Module } from '@nestjs/common';
import { PrismaModule } from '@rumsan/prisma';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [PrismaModule],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
