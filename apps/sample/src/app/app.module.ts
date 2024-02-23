import { Module } from '@nestjs/common';
// import { UsersModule } from '../user/user.module';
import { PrismaModule } from '@rumsan/prisma';

import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RSExceptionModule } from '@rumsan/core';
import { SettingsModule } from '@rumsan/settings';
import {
  AbilityModule,
  AuthsModule,
  RSUserModule,
  RolesModule,
  SignupModule,
  UsersModule,
} from '@rumsan/user';
import { APP_SUBJECTS } from '../constants';
import { ERRORS } from '../constants/errors';
import { ListenerModule } from '../listener/listener.module';
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
    RSUserModule.forRoot([
      UsersModule,
      AuthsModule,
      RolesModule,
      SignupModule.forRoot({ autoApprove: false }),
    ]),
    RSExceptionModule.forRoot({ errorSet: ERRORS }),
    AbilityModule.forRoot({ subjects: APP_SUBJECTS }),
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
