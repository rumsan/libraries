import { Global, Module } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Global()
@Module({
  controllers: [SettingsController],
  providers: [PrismaService, SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {
  constructor(private readonly settingsService: SettingsService) {
    settingsService.load();
  }
}
