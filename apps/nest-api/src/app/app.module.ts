import { Module } from '@nestjs/common';
import { RumsanUserModule, SettingsService } from '@binod7/rumsan-user';
import { PrismaDbModule } from '@binod7/prisma-db';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ListenerModule } from './listeners/listners.module';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './app.config';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		EventEmitterModule.forRoot({ maxListeners: 10, ignoreErrors: false }),
		ListenerModule,
		PrismaDbModule,
		RumsanUserModule,
	],
	controllers: [AppController],
	providers: [AppService, AppConfigService, SettingsService],
	exports: [AppConfigService],
})
export class AppModule {}
