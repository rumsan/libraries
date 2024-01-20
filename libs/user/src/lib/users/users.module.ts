import { Module } from '@nestjs/common';
import { PrismaModule } from '@rumsan/prisma';
import { AuthsModule } from '../auths/auths.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule, AuthsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
