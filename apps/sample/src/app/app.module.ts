import { Module } from '@nestjs/common';
// import { UserModule } from '../user/user.module';

import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RSExceptionModule, RumsanAppModule } from '@rumsan/core';

import { PrismaModule } from '@rumsan/prisma';
import { AbilityModule, RumsanUserModule } from '@rumsan/user';
import { ERRORS } from '../constants/errors';
import { AppDocModule } from '../doc/doc.module';
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
    AppDocModule,
    ListenerModule,
    PrismaModule,
    RumsanUserModule,
    RSExceptionModule.forRoot({ errorSet: ERRORS }),
    RumsanAppModule,
    AbilityModule.forRoot({ subjects: { APP: 'app' } }),
    //SignupModule.register({ autoApprove: false }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
