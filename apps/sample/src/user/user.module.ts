import { Module } from '@nestjs/common';
import { PrismaModule } from '@rumsan/prisma';
import { QueueModule } from '@rumsan/queue'; // Ensure correct import path
import { AuthModule } from '@rumsan/user';
import { AppUserController } from './user.controller';
import { UserProcessor } from './user.processor';
import { AppUserService } from './user.service';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    // QueueModule,
    QueueModule.registerQueue({
      name: 'QUEUE_TEST',
    }),
  ],
  controllers: [AppUserController],
  providers: [UserProcessor, AppUserService],
})
export class UserModule {}
