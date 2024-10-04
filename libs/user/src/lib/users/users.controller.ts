import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ApiCuidParam, xRC } from '@rumsan/extensions/decorators';
import {
  CreateUserDto,
  ListUserDto,
  UpdateUserDto,
} from '@rumsan/extensions/dtos';
import { ERRORS } from '@rumsan/extensions/exceptions';
import { tRC } from '@rumsan/sdk/types';
import { CheckAbilities } from '../ability/ability.decorator';
import { AbilitiesGuard } from '../ability/ability.guard';
import { CU, CurrentUser } from '../auths/decorator';
import { JwtGuard } from '../auths/guard';
import { CUI } from '../auths/interfaces/current-user.interface';
import { ACTIONS, APP, SUBJECTS } from '../constants';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('User')
@ApiBearerAuth(APP.JWT_BEARER)
@UseGuards(JwtGuard, AbilitiesGuard)
export class UsersController<T> {
  constructor(private userService: UsersService) {}

  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  @Get('')
  list(@Query() dto: ListUserDto) {
    return this.userService.list(dto);
  }

  @Post('')
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.USER })
  create(@Body() dto: CreateUserDto, @CurrentUser() cu: CUI) {
    return this.userService.create(dto);
  }

  @Get('me')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.PUBLIC })
  async getMe(@CurrentUser() cu: CUI) {
    const user = await this.userService.getById(cu.id);
    return { ...user, permissions: cu.permissions, roles: cu.roles };
  }

  @Patch('me')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.PUBLIC })
  updateMe(@CU() cu: CUI, @Body() dto: UpdateUserDto, @xRC() rdetails: tRC) {
    return this.userService.updateMe(cu.userId, dto, rdetails);
  }

  @Patch('me/update-auth')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.PUBLIC })
  changePassword(@CU() cu: CUI, @Body() dto: UpdateUserDto) {
    throw ERRORS.NOT_IMPLEMENTED;
    // return this.userService.changePassword(
    //   cu.userId,
    //   dto,
    //   this._getRequestInfo(request),
    // );
  }

  @ApiCuidParam()
  @Get(':cuid')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  get(@Param('cuid') cuid: string) {
    return this.userService.get(cuid);
  }

  @ApiCuidParam()
  @Patch(':cuid')
  @CheckAbilities({ actions: ACTIONS.UPDATE, subject: SUBJECTS.USER })
  update(
    @Param('cuid') cuid: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() cu: CUI,
  ) {
    return this.userService.update(cuid, dto);
  }

  @ApiCuidParam()
  @Delete(':cuid')
  @CheckAbilities({ actions: ACTIONS.DELETE, subject: SUBJECTS.USER })
  delete(@Param('cuid') cuid: string, @CurrentUser() cu: CUI) {
    return this.userService.delete(cuid, cu);
  }

  @ApiCuidParam()
  @Get(':cuid/roles')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  getRoles(@Param('cuid') cuid: string) {
    return this.userService.listRoles(cuid);
  }

  @ApiCuidParam()
  @ApiBody({
    schema: {
      type: 'array',
      example: ['admin', 'user'],
      items: {
        type: 'string',
      },
    },
  })
  @Post(':cuid/roles')
  @CheckAbilities({ actions: ACTIONS.UPDATE, subject: SUBJECTS.USER })
  addRoles(@Param('cuid') cuid: string, @Body() roles: string[]) {
    return this.userService.addRoles(cuid, roles);
  }

  @ApiCuidParam()
  @ApiBody({
    schema: {
      type: 'array',
      example: ['admin', 'user'],
      items: {
        type: 'string',
      },
    },
  })
  @Delete(':cuid/roles')
  @CheckAbilities({ actions: ACTIONS.UPDATE, subject: SUBJECTS.USER })
  removeRoles(@Param('cuid') cuid: string, @Body() roles: string[]) {
    return this.userService.removeRoles(cuid, roles);
  }
}

//cff095ac-3927-4dd6-91a0-72a62aaa05e6
