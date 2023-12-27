import { PrismaService } from '@binod7/prisma-db';
import { Injectable } from '@nestjs/common';
import { AppSettingService } from './setting/setting.service';

@Injectable()
export class AppService {
	constructor(
		private appSetting: AppSettingService,
		private prisma: PrismaService,
	) {}
	async getData() {
		const appName = this.appSetting.get('app_name');
		const d = await this.prisma.user.findMany();
		return { appName, message: 'Hello API', data: d };
	}

	fetchSettings() {
		const settings = this.appSetting.get('app_settings');
		const app = this.appSetting.get('app_name');
		return { app, settings };
	}
}
