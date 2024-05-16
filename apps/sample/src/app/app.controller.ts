import { Controller, Get, Patch, Post } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { APP } from '../constants';
import { AppService } from './app.service';

@Controller('app')
@ApiTags('App')
@ApiBearerAuth(APP.JWT_BEARER)
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  // @UseGuards(JwtGuard, AbilitiesGuard)
  @Get()
  getData() {
    return this.appService.getData();
  }

  // This is just a sample
  @Post('audit')
  postAuditSample() // @Request() req: Request
  {
    return this.appService.postAuditSample(
      1,
      //  req.user.id
    );
  }

  @Patch('audit')
  patchAuditSample() {
    return this.appService.patchAuditSample();
  }
}
