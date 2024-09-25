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
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ACTIONS, APP, SUBJECTS } from '@rumsan/extensions/constants';
import {
  CreateRoleDto,
  EditRoleDto,
  ListRoleDto,
  SearchPermissionDto,
} from '@rumsan/extensions/dtos';
import { JwtGuard } from '@rumsan/extensions/guards';
import { CheckAbilities } from '../ability/ability.decorator';
import { AbilitiesGuard } from '../ability/ability.guard';
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
}
