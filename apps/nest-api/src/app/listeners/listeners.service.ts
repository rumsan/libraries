import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../../constants';
import { AppSettingService } from '../setting/setting.service';

@Injectable()
export class ListenerService {
	constructor(private appSetting: AppSettingService) {}
	@OnEvent(EVENTS.SEND_OTP_EMAIL)
	sendOTPEmail(data: any) {
		console.log('Use your messenger service!', data);
	}

	@OnEvent(EVENTS.REFRESH_APP_SETTINGS)
	refreshAppSettings(data: any) {
		console.log('Updated Settings!', data[1].value);
		this.appSetting.set('app_name', 'DEMO!!');
		const a = this.appSetting.get('app_name');
		console.log('A=>', a);

		// this.appSetting.set('app_settings', data);
	}
}
