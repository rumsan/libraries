import { Module } from '@nestjs/common';
// import { UsersModule } from '../user/user.module';
import { PrismaModule } from '@rumsan/prisma';

import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RSExceptionModule } from '@rumsan/extensions/exceptions';
import { LoggerModule } from '@rumsan/extensions/logger';
import { SettingsModule } from '@rumsan/extensions/settings';
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
    RSUserModule.forRoot([
      UsersModule,
      AuthsModule,
      RolesModule,
      SignupModule.forRoot({ autoApprove: false }),
    ]),
    RSExceptionModule.forRoot({ errorSet: ERRORS }),
    AbilityModule.forRoot({ subjects: APP_SUBJECTS }),
    SettingsModule,
    LoggerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
