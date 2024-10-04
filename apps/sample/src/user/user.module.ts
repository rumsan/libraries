import { Module } from '@nestjs/common';
import { PrismaModule } from '@rumsan/prisma';
import { User } from '@rumsan/sdk/types';
import { UsersController, UsersModule, UsersService } from '@rumsan/user';

type CustomUserDetails = {
  preferences: {
    language: string;
    timezone: string;
  };
  lastLogin: Date;
};

export type AppUser = User & {
  details: CustomUserDetails;
};

@Module({
  imports: [UsersModule, PrismaModule],
  controllers: [UsersController<AppUser>],
  providers: [UsersService],
})
export class AppUsersModule {}
