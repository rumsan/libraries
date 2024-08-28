import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CUI } from '@rumsan/sdk/interfaces';
import { APP } from '../constants';
import { Public } from '../decorators';
import { CurrentUser } from '../decorators/currentUser.decorator';
import { CreateSettingDto, ListSettingDto, UpdateSettngsDto } from '../dtos';
import { JwtGuard } from '../guards';
import { SettingsService } from './settings.service';

@Controller('settings')
@ApiTags('Settings')
@ApiBearerAuth(APP.JWT_BEARER)
@UseGuards(JwtGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('')
  @Public()
  list(@Query() query: ListSettingDto) {
    return this.settingsService.list(query);
  }

  @Post('')
  create(@Body() createSettingDto: CreateSettingDto, @CurrentUser() cu: CUI) {
    console.log({ cu });
    if (cu.name) {
      createSettingDto.createdBy = cu.name;
    }
    createSettingDto.sessionId = cu.sessionId;
    return this.settingsService.create(createSettingDto);
  }

  @Get(':name')
  @Public()
  get(@Param('name') name: string) {
    return this.settingsService.getByName(name);
  }

  @Patch(':name')
  update(
    @Param('name') name: string,
    @Body() dto: UpdateSettngsDto,
    @CurrentUser() cu: CUI,
  ) {
    dto.sessionId = cu.sessionId;
    if (cu.name) dto.updatedBy = cu?.name;
    return this.settingsService.update(name, dto);
  }
}
