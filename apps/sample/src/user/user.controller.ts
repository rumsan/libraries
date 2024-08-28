import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ACTIONS, SUBJECTS } from '@rumsan/extensions/constants';
import { JwtGuard } from '@rumsan/extensions/guards';
import { AbilitiesGuard, CheckAbilities } from '@rumsan/user';
import { APP } from '../constants';
import { AppUsersService } from './user.service';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth(APP.JWT_BEARER)
@UseGuards(JwtGuard, AbilitiesGuard)
export class AppUsersController {
  constructor(private service: AppUsersService) {}

  @Get('sample')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  list() {
    return this.service.Test({});
  }
}
