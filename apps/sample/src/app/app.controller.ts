import { Controller, Get } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppId } from '@rumsan/app';
import { APP } from '../constants';
import { AppService } from './app.service';

@Controller('sample-app')
@ApiTags('Sample App')
@ApiBearerAuth(APP.JWT_BEARER)
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  // @UseGuards(JwtGuard, AbilitiesGuard)
  @Get()
  getData(@AppId() appId: string) {
    console.log(appId);
    return this.appService.getData();
  }
}
