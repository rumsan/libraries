import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ACTIONS,
  AbilitiesGuard,
  CheckAbilities,
  JwtGuard,
  SUBJECTS,
} from '@rumsan/user';
import { APP } from '../constants';
import { AppUsersService } from './user.service';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth(APP.JWT_BEARER)
@UseGuards(JwtGuard, AbilitiesGuard)
export class AppUsersController {
  constructor(private service: AppUsersService) {}

  @Get('app/nice')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  test() {
    return this.service.Test({});
  }
}
