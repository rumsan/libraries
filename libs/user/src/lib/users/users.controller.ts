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
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ACTIONS, APP, SUBJECTS } from '@rumsan/extensions/constants';
import {
  ApiUuidParam,
  CU,
  CurrentUser,
  RequestDetails,
} from '@rumsan/extensions/decorators';
import {
  CreateUserDto,
  ListUserDto,
  UpdateUserDto,
} from '@rumsan/extensions/dtos';
import { ERRORS } from '@rumsan/extensions/exceptions';
import { JwtGuard } from '@rumsan/extensions/guards';
import { CUI } from '@rumsan/sdk/interfaces';
import { Request } from '@rumsan/sdk/types';
import { UUID } from 'crypto';
import { CheckAbilities } from '../ability/ability.decorator';
import { AbilitiesGuard } from '../ability/ability.guard';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth(APP.JWT_BEARER)
@UseGuards(JwtGuard, AbilitiesGuard)
export class UsersController {
  constructor(private userService: UsersService) {}

  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  @Get('')
  list(@Query() dto: ListUserDto) {
    return this.userService.list(dto);
  }

  @Post('')
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.USER })
  create(@Body() dto: CreateUserDto, @CurrentUser() cu: CUI) {
    dto.createdBy = cu.uuid;
    dto.sessionId = cu.sessionId;
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
  updateMe(
    @CU() cu: CUI,
    @Body() dto: UpdateUserDto,
    @RequestDetails() rdetails: any,
  ) {
    dto.updatedBy = cu.uuid;
    dto.sessionId = cu.sessionId;
    return this.userService.updateMe(cu.userId, dto, rdetails);
  }

  @Patch('me/update-auth')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.PUBLIC })
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

  @ApiUuidParam()
  @Get(':uuid')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  get(@Param('uuid') uuid: UUID) {
    return this.userService.get(uuid);
  }

  @ApiUuidParam()
  @Patch(':uuid')
  @CheckAbilities({ actions: ACTIONS.UPDATE, subject: SUBJECTS.USER })
  update(
    @Param('uuid') uuid: UUID,
    @Body() dto: UpdateUserDto,
    @CurrentUser() cu: CUI,
  ) {
    dto.updatedBy = cu.uuid;
    dto.sessionId = cu.sessionId;
    return this.userService.update(uuid, dto);
  }

  @ApiUuidParam()
  @Delete(':uuid')
  @CheckAbilities({ actions: ACTIONS.DELETE, subject: SUBJECTS.USER })
  delete(@Param('uuid') uuid: UUID, @CurrentUser() cu: CUI) {
    return this.userService.delete(uuid, cu);
  }

  @ApiUuidParam()
  @Get(':uuid/roles')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  getRoles(@Param('uuid') uuid: UUID) {
    return this.userService.listRoles(uuid);
  }

  @ApiUuidParam()
  @ApiBody({
    schema: {
      type: 'array',
      example: ['admin', 'user'],
      items: {
        type: 'string',
      },
    },
  })
  @Post(':uuid/roles')
  @CheckAbilities({ actions: ACTIONS.UPDATE, subject: SUBJECTS.USER })
  addRoles(@Param('uuid') uuid: UUID, @Body() roles: string[]) {
    return this.userService.addRoles(uuid, roles);
  }

  @ApiUuidParam()
  @ApiBody({
    schema: {
      type: 'array',
      example: ['admin', 'user'],
      items: {
        type: 'string',
      },
    },
  })
  @Delete(':uuid/roles')
  @CheckAbilities({ actions: ACTIONS.UPDATE, subject: SUBJECTS.USER })
  removeRoles(@Param('uuid') uuid: UUID, @Body() roles: string[]) {
    return this.userService.removeRoles(uuid, roles);
  }
}

//cff095ac-3927-4dd6-91a0-72a62aaa05e6
