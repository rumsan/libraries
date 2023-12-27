import { SettingsService } from '@binod7/rumsan-user';
import { Global, Injectable } from '@nestjs/common';

@Global()
@Injectable()
export class AppSettingService {
	constructor(private settingsService: SettingsService) {
		this.refreshSettings();
	}
	private config = {
		// your initial configuration values
		APP_NAME: 'RS User',
		PORT: 4040,
	};

	get(key: string): any {
		return this.config[key];
	}

	set(key: string, value: any): void {
		this.config[key] = value;
	}

	async refreshSettings() {
		console.log('HURRAY!');
		const d = await this.settingsService.listPublic();
		this.set('app_settings', d);
	}
}
