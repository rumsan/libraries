import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiUuidParam, RequestDetails } from '@rumsan/extensions/decorators';
import {
  AssignRoleDto,
  CreateUserDto,
  ListUserDto,
  UpdateRoleAssignmentDto,
  UpdateUserDto,
} from '@rumsan/extensions/dtos';
import { ERRORS } from '@rumsan/extensions/exceptions';
import { Request } from '@rumsan/sdk/types';
import { UUID } from 'crypto';
import { CheckAbilities } from '../ability/ability.decorator';
import { AbilitiesGuard } from '../ability/ability.guard';
import { CU, CurrentUser } from '../auths/decorator';
import { JwtGuard } from '../auths/guard';
import { CUI } from '../auths/interfaces/current-user.interface';
import { ACTIONS, APP, SUBJECTS } from '../constants';
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

  // ===================== Project-Scoped Role Assignment APIs =====================

  @Post(':uuid/roles/assign')
  @CheckAbilities({ actions: ACTIONS.UPDATE, subject: SUBJECTS.USER })
  assignRoleInProject(@Param('uuid') uuid: string, @Body() dto: AssignRoleDto) {
    return this.userService.assignRoleInProject(uuid, dto);
  }

  @Get(':uuid/xrefId/:xrefId/roles')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  listRolesInProject(
    @Param('uuid') uuid: string,
    @Param('xrefId') xrefId: string,
  ) {
    return this.userService.listRolesInProject(uuid, xrefId);
  }

  @Delete(':uuid/xrefId/:xrefId/roles/:name')
  @CheckAbilities({ actions: ACTIONS.UPDATE, subject: SUBJECTS.USER })
  removeRoleInProject(
    @Param('uuid') uuid: string,
    @Param('xrefId') xrefId: string,
    @Param('name') name: string,
  ) {
    return this.userService.removeRoleInProject(uuid, xrefId, name);
  }

  @Put(':uuid/xrefId/:xrefId/roles/:name')
  @CheckAbilities({ actions: ACTIONS.UPDATE, subject: SUBJECTS.USER })
  updateRoleAssignmentInProject(
    @Param('uuid') uuid: string,
    @Param('xrefId') xrefId: string,
    @Param('name') name: string,
    @Body() dto: UpdateRoleAssignmentDto,
  ) {
    return this.userService.updateRoleAssignmentInProject(
      uuid,
      xrefId,
      name,
      dto,
    );
  }

  // ===================== User Role Query APIs =====================

  @Get(':uuid/roles/active')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  listActiveRoles(@Param('uuid') uuid: string) {
    return this.userService.listActiveRoles(uuid);
  }

  @Get(':uuid/permissions')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  listAllPermissions(@Param('uuid') uuid: string) {
    return this.userService.listAllPermissions(uuid);
  }

  @Get(':uuid/xrefId/:xrefId/permissions')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  listPermissionsInProject(
    @Param('uuid') uuid: string,
    @Param('xrefId') xrefId: string,
  ) {
    return this.userService.listPermissionsInProject(uuid, xrefId);
  }
  // ===================== Project-Centric Query APIs =====================
  @Get('xrefId/:xrefId')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'includeExpired', required: false, type: Boolean })
  listUsersInProject(
    @Param('xrefId') xrefId: string,
    @Query('name') name?: string,
    @Query('includeExpired') includeExpired?: boolean,
  ) {
    return this.userService.listUsersInProject(xrefId, name, includeExpired);
  }

  @Get('xrefId/:xrefId/roles/:name')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  @ApiQuery({ name: 'includeExpired', required: false, type: Boolean })
  listUsersByRoleInProject(
    @Param('xrefId') xrefId: string,
    @Param('name') name: string,
    @Query('includeExpired') includeExpired?: boolean,
  ) {
    return this.userService.listUsersByRoleInProject(
      xrefId,
      name,
      includeExpired,
    );
  }

  @Get(':uuid/xrefId/:xrefId/abilities')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.PUBLIC })
  getUserAbilitiesInProject(
    @Param('uuid') uuid: string,
    @Param('xrefId') xrefId: string,
  ) {
    return this.userService.getUserAbilitiesInProject(uuid, xrefId);
  }
}

//cff095ac-3927-4dd6-91a0-72a62aaa05e6
