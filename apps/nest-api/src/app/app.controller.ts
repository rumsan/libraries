import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { AppService } from './app.service';
import { AbilitiesGuard, CheckAbilities, JwtGuard } from '@binod7/rumsan-user';
import { ACTIONS, APP, SUBJECTS } from '../constants';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('app')
@ApiTags('App')
@ApiBearerAuth(APP.JWT_BEARER)
export class AppController {
	constructor(private readonly appService: AppService) {}

	@CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.USER })
	@UseGuards(JwtGuard, AbilitiesGuard)
	@Get()
	getData() {
		return this.appService.getData();
	}

	@Get('settings')
	listSettings() {
		return require('./setting/setting.config').listSettings();
	}

	@Get('settings/:name')
	getEmailSettings(@Param('name') name: string) {
		return require('./setting/setting.config').getSetting(name);
	}
}
