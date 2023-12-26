import { PrismaService } from '@binod7/prisma-db';
import { Injectable } from '@nestjs/common';
import { AppConfigService } from './app.config';

@Injectable()
export class AppService {
	constructor(
		private prisma: PrismaService,
		private appConfig: AppConfigService,
	) {}
	async getData() {
		const appName = this.appConfig.get('APP_NAME');
		const d = await this.prisma.user.findMany();
		return { appName, message: 'Hello API', data: d };
	}

	async updateAppConfig() {
		this.appConfig.set('APP_NAME', 'DEMO APP');
		return 'Config updated!';
	}
}
