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
import { CreateSettingDto, ListSettingDto, UpdateSettngsDto } from '../dtos';
import { SettingsService } from './settings.service';

@Controller('settings')
@ApiTags('Settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('')
  list(@Query() query: ListSettingDto) {
    console.log(query);
    return this.settingsService.list(query);
  }

  @Post('')
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @Get(':name')
  get(@Param('name') name: string) {
    return this.settingsService.getByName(name);
  }

  @Patch(':name')
  udpdate(@Param('name') name: string, @Body() @Body() dto: UpdateSettngsDto) {
    return this.settingsService.update(name, dto);
  }
}
