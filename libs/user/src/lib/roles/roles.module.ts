import { Module } from '@nestjs/common';
import { PrismaModule } from '@rumsan/prisma';
import { AbilityModule } from '../ability/ability.module';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [PrismaModule, AbilityModule.forRoot()],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
