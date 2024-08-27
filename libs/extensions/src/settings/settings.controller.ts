import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CUI } from '@rumsan/sdk/interfaces';
import { CurrentUser } from '../decorators/currentUser.decorator';
import { CreateSettingDto, ListSettingDto, UpdateSettngsDto } from '../dtos';
import { SettingsService } from './settings.service';

@Controller('settings')
@ApiTags('Settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('')
  list(@Query() query: ListSettingDto) {
    return this.settingsService.list(query);
  }

  @Post('')
  create(@Body() createSettingDto: CreateSettingDto, @CurrentUser() cu: CUI) {
    // console.log({ cu });
    // if (cu.name) {
    //   createSettingDto.createdBy = cu.name;
    // }
    // createSettingDto.sessionId = cu.sessionId;
    return this.settingsService.create(createSettingDto);
  }

  @Get(':name')
  get(@Param('name') name: string) {
    return this.settingsService.getByName(name);
  }

  @Patch(':name')
  udpdate(@Param('name') name: string, @Body() dto: UpdateSettngsDto) {
    console.log({ name, dto });
    return this.settingsService.update(name, dto);
  }
}
