import { SettingsService } from '@binod7/rumsan-user';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppSettingService {
	constructor(private settingsService: SettingsService) {
		this.refreshSettings();
	}

	async refreshSettings() {
		console.log('Refreshed!!');
		const d = await this.settingsService.listPublic();
		require('../setting/setting.config').setSettings(d);
	}
}
