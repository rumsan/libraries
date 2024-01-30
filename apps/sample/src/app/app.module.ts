import { Module } from '@nestjs/common';
// import { UserModule } from '../user/user.module';
import { PrismaModule } from '@rumsan/prisma';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { QueueModule } from '@rumsan/queue';
import { RumsanUserModule, SignupModule } from '@rumsan/user';
import { ListenerModule } from '../listener/listener.module';
import { UserModule } from '../user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// bullmq.transport.ts

@Module({
  imports: [
    QueueModule.forRoot({
      imports: [ConfigModule],
      global: true,
      useFactory: async (configService: ConfigService) => ({
        connection: {
          name: 'default',
          host: configService.get<string>('REDIS_HOST'),
          port: +configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
          retryStrategy: (times) => {
            // reconnect after
            return Math.min(times * 50, 2000);
          },
          // might need to change on producttion
          maxRetriesPerRequest: 1000,
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot({ maxListeners: 10, ignoreErrors: false }),
    ListenerModule,
    PrismaModule,
    UserModule,
    RumsanUserModule,
    SignupModule.register({ autoApprove: false }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
