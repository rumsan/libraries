import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { PrismaDbModule, PrismaService } from '@binod7/prisma-db';
import { UserModule } from './user/user.module';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AbilityModule } from './ability/ability.module';
import { RolesModule } from './roles/roles.module';
import { RolesService } from './roles/roles.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SettingsModule } from './settings/settings.module';
import { SettingsService } from './settings/settings.service';

@Module({
	controllers: [AuthController, UserController],
	providers: [
		AuthService,
		PrismaService,
		UserService,
		JwtService,
		RolesService,
		SettingsService,
	],
	imports: [
		AbilityModule,
		EventEmitterModule.forRoot({ maxListeners: 10, ignoreErrors: false }),
		ConfigModule.forRoot({ isGlobal: true }),
		PrismaDbModule,
		AuthModule,
		UserModule,
		RolesModule,
		SettingsModule,
	],
	exports: [SettingsService],
})
export class RumsanUserModule {}
