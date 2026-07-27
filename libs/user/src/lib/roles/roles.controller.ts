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
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AddPermissionDto,
  BulkAddPermissionsDto,
  BulkDeletePermissionsDto,
  CreateRoleDto,
  EditPermissionDto,
  EditRoleDto,
  ListRoleDto,
  SearchPermissionDto,
} from '@rumsan/extensions/dtos';
import { CheckAbilities } from '../ability/ability.decorator';
import { AbilitiesGuard } from '../ability/ability.guard';
import { JwtGuard } from '../auths/guard';
import { ACTIONS, APP, SUBJECTS } from '../constants';
import { RolesService } from './roles.service';

@Controller('roles')
@ApiTags('Roles & Permissions')
@ApiBearerAuth(APP.JWT_BEARER)
@UseGuards(JwtGuard, AbilitiesGuard)
export class RolesController {
  constructor(private roleService: RolesService) {}

  @Post()
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.ROLE })
  async createRole(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  @Get()
  @CheckAbilities({
    actions: '*',
    subject: SUBJECTS.ROLE,
  })
  async listRoles(@Query() dto: ListRoleDto) {
    return this.roleService.list(dto);
  }

  @Post('search-by-permission')
  @CheckAbilities({ actions: '*', subject: SUBJECTS.ROLE })
  async searchRolesByPermission(
    @Body(ValidationPipe) permissionQuery: SearchPermissionDto,
  ) {
    return this.roleService.getRolesByPermission(
      permissionQuery.action,
      permissionQuery.subject,
    );
  }

  @CheckAbilities({ actions: ACTIONS.UPDATE, subject: SUBJECTS.ROLE })
  @Patch(':name')
  async updateRole(@Param('name') name: string, @Body() dto: EditRoleDto) {
    return this.roleService.update(name, dto);
  }

  @CheckAbilities({ actions: ACTIONS.DELETE, subject: SUBJECTS.ROLE })
  @Delete(':name')
  async deleteRole(@Param('name') name: string) {
    return this.roleService.delete(name);
  }

  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.ROLE })
  @Get(':name')
  async getRole(@Param('name') name: string) {
    return this.roleService.getRoleByName(name, true);
  }

  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.ROLE })
  @Get(':name/permissions')
  async listPermsByRole(@Param('name') name: string) {
    return this.roleService.listPermissionsByRole(name);
  }

  // ===================== Permission Management APIs =====================

  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.ROLE })
  @Post(':name/permissions')
  @ApiOperation({
    description:
      'Add a single permission to a role by providing the role ID and permission details.',
  })
  async addPermission(
    @Param('name') name: string,
    @Body() dto: AddPermissionDto,
  ) {
    return this.roleService.addPermissionToRole(name, dto);
  }

  @CheckAbilities({ actions: ACTIONS.UPDATE, subject: SUBJECTS.ROLE })
  @Put('permissions/:permissionId')
  async updatePermission(
    @Param('permissionId') permissionId: string,
    @Body() dto: EditPermissionDto,
  ) {
    return this.roleService.updatePermission(Number(permissionId), dto);
  }

  @CheckAbilities({ actions: ACTIONS.DELETE, subject: SUBJECTS.ROLE })
  @Delete('permissions/:permissionId')
  async deletePermission(@Param('permissionId') permissionId: string) {
    return this.roleService.deletePermission(Number(permissionId));
  }

  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.ROLE })
  @Post(':name/permissions/bulk')
  async bulkAddPermissions(
    @Param('name') name: string,
    @Body() dto: BulkAddPermissionsDto,
  ) {
    return this.roleService.bulkAddPermissions(name, dto);
  }

  @CheckAbilities({ actions: ACTIONS.DELETE, subject: SUBJECTS.ROLE })
  @Delete(':name/permissions/bulk')
  async bulkDeletePermissions(
    @Param('name') name: string,
    @Body() dto: BulkDeletePermissionsDto,
  ) {
    return this.roleService.bulkDeletePermissions(name, dto);
  }

  // ===================== Project-Centric Query APIs =====================
  @Get('xrefId/:xrefId')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  listRolesInProject(@Param('xrefId') xrefId: string) {
    return this.roleService.listRolesInProject(xrefId);
  }
}
