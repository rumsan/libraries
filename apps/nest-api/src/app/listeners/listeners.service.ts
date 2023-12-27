import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../../constants';

@Injectable()
export class ListenerService {
	constructor() {}
	@OnEvent(EVENTS.SEND_OTP_EMAIL)
	sendOTPEmail(data: any) {
		console.log('Use your messenger service!', data);
	}

	@OnEvent(EVENTS.REFRESH_APP_SETTINGS)
	refreshAppSettings(data: any) {
		require('../setting/setting.config').setSettings(data);
	}
}
