import { Module } from '@nestjs/common';
import { PrismaModule } from '@rumsan/prisma';
import { User } from '@rumsan/sdk/types';
import { AbilityModule } from '../ability/ability.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule, AbilityModule.forRoot()],
  controllers: [UsersController<User>],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
