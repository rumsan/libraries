import { PrismaService } from '@binod7/prisma-db';
import { Injectable } from '@nestjs/common';
import { AppSettingService } from './setting/setting.service';

@Injectable()
export class AppService {
	constructor(private appConfig: AppSettingService) {}
	async getData() {
		// const appName = this.appConfig.get('APP_NAME');
		// const d = await this.prisma.user.findMany();
		// return { appName, message: 'Hello API', data: d };
	}

	fetchSettings() {
		return this.appConfig.get('app_settings');
	}
}
