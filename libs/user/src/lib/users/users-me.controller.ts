import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { xRC } from '@rumsan/extensions/decorators';
import { UpdateUserDto } from '@rumsan/extensions/dtos';
import { tRC } from '@rumsan/sdk';
import { CU, CurrentUser } from '../auths/decorator';
import { JwtGuard } from '../auths/guard';
import { CUI } from '../auths/interfaces/current-user.interface';
import { APP } from '../constants';
import { UsersService } from './users.service';

@Controller('profile')
@ApiTags('Profile')
@ApiBearerAuth(APP.JWT_BEARER)
@UseGuards(JwtGuard)
export class UsersMeController {
  constructor(private userService: UsersService) {}

  @Get()
  async getMe(@CurrentUser() cu: CUI) {
    const user = await this.userService.getById(cu.id);
    return { ...user, permissions: cu.permissions, roles: cu.roles };
  }

  @Patch()
  updateMe(@CU() cu: CUI, @Body() dto: UpdateUserDto, @xRC() rdetails: tRC) {
    return this.userService.updateMe(cu.cuid, dto, rdetails);
  }
}
