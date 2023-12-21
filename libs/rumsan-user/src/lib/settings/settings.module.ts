import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { PrismaDbModule } from '@binod7/prisma-db';

@Module({
	imports: [PrismaDbModule],
	providers: [SettingsService],
	controllers: [SettingsController],
	exports: [SettingsService],
})
export class SettingsModule {}
