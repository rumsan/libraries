import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ACTIONS, APP, SUBJECTS } from '../constants';
import { SettingsService } from './settings.service';
import { JwtGuard } from '../auth/guard';
import { AbilitiesGuard } from '../ability/ability.guard';
import { CheckAbilities } from '../ability/ability.decorator';

@Controller('settings')
@ApiTags('Settings')
@ApiBearerAuth(APP.JWT_BEARER)
@UseGuards(JwtGuard, AbilitiesGuard)
export class SettingsController {
	constructor(private settingService: SettingsService) {}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
	@Post()
	createSettings(@Body() dto: any) {
		return this.settingService.create(dto);
	}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
	@Get()
	listPublicSettings() {
		return this.settingService.listPublicOnly();
	}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
	@Get(':id')
	async getById(@Param('id') id: number) {
		const row = await this.settingService.getById(id);
		if (row?.isPrivate)
			return {
				success: true,
				message: 'Private settings are restricted to access!',
			};
		return row;
	}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
	@Get(':name/name')
	async getByName(@Param('name') name: string) {
		const row = await this.settingService.getByName(name);
		if (row?.isPrivate)
			return {
				success: true,
				message: 'Private settings are restricted to access!',
			};
		return row;
	}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
	@Delete(':id')
	deleteById(@Param('id') id: number) {
		return this.settingService.delete(id);
	}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
	@Patch(':id')
	updateById(@Param('id') id: number, @Body() dto: any) {
		return this.settingService.update(id, dto);
	}
}
