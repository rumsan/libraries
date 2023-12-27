import { Global, Module } from '@nestjs/common';
import { AppSettingService } from './setting.service';
import { SettingsService } from '@binod7/rumsan-user';
import { PrismaDbModule } from '@binod7/prisma-db';

@Global()
@Module({
	imports: [PrismaDbModule],
	providers: [AppSettingService, SettingsService],
	exports: [],
})
export class AppSettingModule {}
