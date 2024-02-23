import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateSettingDto, UpdateSettingDto } from '@rumsan/sdk/dtos';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('')
  listPublic() {
    return this.settingsService.listPublic();
  }

  @Post('')
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @Get(':name')
  getPublic(@Param('name') name: string) {
    return this.settingsService.getPublic(name);
  }

  @Patch(':name')
  udpdate(@Param('name') name: string, @Body() dto: UpdateSettingDto) {
    return this.settingsService.update(name, dto.value);
  }
}
