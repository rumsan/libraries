import { Module } from '@nestjs/common';
// import { RsUserModule } from '@rumsan/user';
// import { PrismaDbModule } from '@rumsan/prisma';
import { PrismaDbModule } from '@binod7/prisma-db';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ListenerModule } from './listeners/listners.module';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		EventEmitterModule.forRoot({ maxListeners: 10, ignoreErrors: false }),
		ListenerModule,
		PrismaDbModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
