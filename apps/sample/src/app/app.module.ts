import { Module } from '@nestjs/common';
// import { UsersModule } from '../user/user.module';
import { PrismaModule } from '@rumsan/prisma';

import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RSExceptionModule } from '@rumsan/core';
import { SettingsModule } from '@rumsan/settings';
import { AbilityModule, RumsanUsersModule } from '@rumsan/user';
import { APP_SUBJECTS } from '../constants';
import { ERRORS } from '../constants/errors';
import { ListenerModule } from '../listener/listener.module';
import { AppUsersModule } from '../user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot({
      maxListeners: 10,
      ignoreErrors: false,
    }),
    ListenerModule,
    PrismaModule,
    AppUsersModule,
    RumsanUsersModule,
    RSExceptionModule.forRoot({ errorSet: ERRORS }),
    AbilityModule.forRoot({ subjects: APP_SUBJECTS }),
    SettingsModule,
    //SignupModule.register({ autoApprove: false }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
