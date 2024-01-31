import { Controller, Get } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller('app')
@ApiTags('App')
//@ApiBearerAuth(APP.JWT_BEARER)
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.USER })
  // @UseGuards(JwtGuard, AbilitiesGuard)
  @Get()
  getData() {
    return this.appService.getData();
  }
}
