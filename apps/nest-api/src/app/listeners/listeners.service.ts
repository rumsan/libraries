import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../../constants';
// import { AppConfigService } from '../app.config';

@Injectable()
export class ListenerService {
	// constructor(private appConfig: AppConfigService) {}
	@OnEvent(EVENTS.SEND_OTP_EMAIL)
	sendOTPEmail(data: any) {
		console.log('Use your messenger service!', data);
	}

	@OnEvent(EVENTS.REFRESH_APP_SETTINGS)
	refreshAppSettings(data: any) {
		console.log('Updated Settings!', data);
		// this.appConfig.set('app_settings', data);
	}
}
