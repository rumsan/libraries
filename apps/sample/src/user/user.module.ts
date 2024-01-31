import { Module } from '@nestjs/common';
import { PrismaModule } from '@rumsan/prisma';
import { QueueModule, QueueService } from '@rumsan/queue';
import { AuthModule } from '@rumsan/user';
import { AppUserController } from './user.controller';
import { UserProcessor } from './user.processor';
import { AppUserService } from './user.service';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    //QueueModule,
    QueueModule.registerQueue({
      name: 'APP_QUEUE',
    }),
  ],
  controllers: [AppUserController],
  providers: [UserProcessor, AppUserService, QueueService],
})
export class UserModule {}
