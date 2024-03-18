import { Controller, Get } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { APP } from '../constants';
import { AppService } from './app.service';

@Controller('app')
@ApiTags('App')
@ApiBearerAuth(APP.JWT_BEARER)
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) { }

  // @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  // @UseGuards(JwtGuard, AbilitiesGuard)
  @Get()
  getData() {
    return this.appService.getData();
  }
}
