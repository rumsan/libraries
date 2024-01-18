import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AbilitiesGuard, CheckAbilities, JwtGuard } from '@rumsan/user';
import { ACTIONS, APP, SUBJECTS } from '../constants';
import { AppUserService } from './user.service';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth(APP.JWT_BEARER)
@UseGuards(JwtGuard, AbilitiesGuard)
export class AppUserController {
  constructor(private service: AppUserService) {}

  @Get('app/nice')
  @CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.USER })
  test() {
    return this.service.Test({});
  }
}
