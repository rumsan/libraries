import { Module } from '@nestjs/common';
import { PrismaModule } from '@rumsan/prisma';
import { QueueModule } from '@rumsan/queue';
import { AuthModule } from '@rumsan/user';
import { AppUserController } from './user.controller';
import { UserProcessor } from './user.processor';
import { AppUserService } from './user.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [AppUserController],

  providers: [UserProcessor, AppUserService, QueueModule],
})
export class UserModule {}
