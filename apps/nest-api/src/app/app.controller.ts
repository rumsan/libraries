import { Controller, Get, UseGuards } from '@nestjs/common';

import { AppService } from './app.service';
import { AbilitiesGuard, CheckAbilities, JwtGuard } from '@binod7/rumsan-user';
import { ACTIONS, APP, SUBJECTS } from '../constants';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppSettingService } from './setting/setting.service';

@Controller('app')
@ApiTags('App')
@ApiBearerAuth(APP.JWT_BEARER)
export class AppController {
	constructor(
		private readonly appService: AppService,
		private appSetting: AppSettingService,
	) {}

	@CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.USER })
	@UseGuards(JwtGuard, AbilitiesGuard)
	@Get()
	getData() {
		return this.appService.getData();
	}

	@Get('name')
	updateAppName() {
		return this.appSetting.set('app_name', 'demo');
	}

	@Get('settings')
	listSettings() {
		return this.appService.fetchSettings();
	}
}
