import { Module } from '@nestjs/common';
import { PrismaModule } from '@rumsan/prisma';
import { UsersModule } from '@rumsan/user';
import { AppUsersController } from './user.controller';
import { AppUsersService } from './user.service';

@Module({
  imports: [UsersModule, PrismaModule],
  controllers: [AppUsersController],
  providers: [AppUsersService],
})
export class AppUsersModule {}
