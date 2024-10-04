import { Module } from '@nestjs/common';
// import { UsersModule } from '../user/user.module';
import { PrismaModule } from '@rumsan/prisma';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RSExceptionModule } from '@rumsan/extensions/exceptions';
import { PgClient, PgNotificationService } from '@rumsan/extensions/pgsql';
import { SettingsModule } from '@rumsan/extensions/settings';
import {
  AbilityModule,
  AuthsModule,
  RolesModule,
  RSUserModule,
  SignupModule,
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
    //AppUsersModule,
    RSUserModule.forRoot([
      AuthsModule,
      RolesModule,
      SignupModule.forRoot({ autoApprove: true }),
    ]),
    AppUsersModule,
    RSExceptionModule.forRoot({ errorSet: ERRORS }),
    AbilityModule.forRoot({ subjects: APP_SUBJECTS }),
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      // PgClient is injected with configuration from the environment
      provide: PgClient,
      useFactory: (configService: ConfigService) => {
        const connectionConfig = {
          host: configService.get('DB_HOST'),
          database: configService.get('DB_MANAGER_DB'),
          user: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          port: configService.get<number>('DB_PORT', 5432),
        };
        const pgClient = new PgClient(connectionConfig);
        pgClient.connect(); // Connect to PostgreSQL on startup
        return pgClient;
      },
      inject: [ConfigService],
    },
    AppService,
    PgNotificationService,
  ],
})
export class AppModule {}
