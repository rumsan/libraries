import { Module } from '@nestjs/common';
import { PrismaModule } from '@rumsan/prisma';
import { UserModule } from '@rumsan/user';
import { AppUserController } from './user.controller';
import { AppUserService } from './user.service';

@Module({
  imports: [UserModule, PrismaModule],
  controllers: [AppUserController],
  providers: [AppUserService],
})
export class AppUserModule {}
