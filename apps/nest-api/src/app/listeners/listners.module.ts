import { Module } from '@nestjs/common';
import { ListenerService } from './listeners.service';
import { AppSettingService } from '../setting/setting.service';
import { SettingsService } from '@binod7/rumsan-user';
import { PrismaDbModule } from '@binod7/prisma-db';

@Module({
	imports: [PrismaDbModule],
	providers: [ListenerService, AppSettingService, SettingsService],
})
export class ListenerModule {}
