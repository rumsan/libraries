import { Controller, Get, Inject } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Logger, LoggerKey } from '@rumsan/extensions/logger';
import { APP } from '../constants';
import { AppService } from './app.service';

@Controller('app')
@ApiTags('App')
@ApiBearerAuth(APP.JWT_BEARER)
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(LoggerKey) private logger: Logger,
  ) {}

  // @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  // @UseGuards(JwtGuard, AbilitiesGuard)
  @Get()
  getData() {
    this.logger.info('Getting data');
    return this.appService.getData();
  }
}
