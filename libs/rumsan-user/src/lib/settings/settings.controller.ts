import {
	Body,
	Controller,
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
import { CreateSettingsDto, EditSettingsDto } from './dto';

@Controller('settings')
@ApiTags('Settings')
@ApiBearerAuth(APP.JWT_BEARER)
@UseGuards(JwtGuard, AbilitiesGuard)
export class SettingsController {
	constructor(private settingService: SettingsService) {}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
	@Post()
	createSettings(@Body() dto: CreateSettingsDto) {
		return this.settingService.create(dto);
	}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
	@Get()
	listPublicSettings() {
		return this.settingService.listPublic();
	}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
	@Get(':id')
	getById(@Param('id') id: number) {
		return this.settingService.getPublic(id);
	}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
	@Get(':name/name')
	getByName(@Param('name') name: string) {
		return this.settingService.getByName(name);
	}

	// @HttpCode(HttpStatus.OK)
	// @CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
	// @Delete(':id')
	// deleteById(@Param('id') id: number) {
	// 	return this.settingService.delete(id);
	// }

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
	@Patch('')
	updateById(@Body() dto: EditSettingsDto) {
		return this.settingService.updateByName(dto);
	}
}
