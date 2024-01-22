import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ERRORS } from '@rumsan/core';
import { UUID } from 'crypto';
import { Request } from 'express';
import { CheckAbilities } from '../ability/ability.decorator';
import { AbilitiesGuard, SkipAbilitiesGuard } from '../ability/ability.guard';
import { CU, CurrentUser } from '../auths/decorator';
import { JwtGuard } from '../auths/guard';
import { CUI } from '../auths/interfaces/current-user.interface';
import { ACTIONS, APP, SUBJECTS } from '../constants';
import { CreateUserDto, UpdateUserDto } from './dto';
import { UserListDto } from './dto/users-list.dto';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth(APP.JWT_BEARER)
@UseGuards(JwtGuard, AbilitiesGuard)
export class UsersController {
  constructor(private userService: UsersService) {}
  _getRequestInfo(request: Request) {
    return {
      ip: request.ip,
      userAgent: request.get('user-agent'),
    };
  }

  @CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.USER })
  @Get('')
  list(@Query() dto: UserListDto) {
    return this.userService.list(dto);
  }

  @Post('')
  @CheckAbilities({ action: ACTIONS.CREATE, subject: SUBJECTS.USER })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get('me')
  @SkipAbilitiesGuard()
  async getMe(@CurrentUser() cu: CUI) {
    const user = await this.userService.getById(cu.id);
    return { ...user, permissions: cu.permissions, roles: cu.roles };
  }

  @Patch('me')
  @SkipAbilitiesGuard()
  updateMe(@CU() cu: CUI, @Body() dto: UpdateUserDto, @Req() request: Request) {
    return this.userService.updateMe(
      cu.userId,
      dto,
      this._getRequestInfo(request),
    );
  }

  @Patch('me/update-auth')
  @SkipAbilitiesGuard()
  changePassword(
    @CU() cu: CUI,
    @Body() dto: UpdateUserDto,
    @Req() request: Request,
  ) {
    throw ERRORS.NOT_IMPLEMENTED;
    // return this.userService.changePassword(
    //   cu.userId,
    //   dto,
    //   this._getRequestInfo(request),
    // );
  }

  @Get(':uuid')
  @CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.USER })
  get(@Param('uuid') uuid: UUID) {
    return this.userService.get(uuid);
  }

  @Patch(':uuid')
  @CheckAbilities({ action: ACTIONS.UPDATE, subject: SUBJECTS.USER })
  update(@Param('uuid') uuid: UUID, @Body() dto: UpdateUserDto) {
    return this.userService.update(uuid, dto);
  }

  @Delete(':uuid')
  @CheckAbilities({ action: ACTIONS.DELETE, subject: SUBJECTS.USER })
  delete(@Param('uuid') uuid: UUID) {
    return this.userService.delete(uuid);
  }

  @Get(':uuid/roles')
  @CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.USER })
  getRoles(@Param('uuid') uuid: UUID) {
    return this.userService.get(uuid);
  }

  @Post(':uuid/roles')
  @CheckAbilities({ action: ACTIONS.UPDATE, subject: SUBJECTS.USER })
  addRoles(@Param('uuid') uuid: UUID, @Body() dto: UpdateUserDto) {
    return this.userService.update(uuid, dto);
  }

  @Delete(':uuid/roles')
  @CheckAbilities({ action: ACTIONS.UPDATE, subject: SUBJECTS.USER })
  removeRoles(@Param('uuid') uuid: UUID, @Body() dto: UpdateUserDto) {
    return this.userService.update(uuid, dto);
  }
}
