import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckAbilities } from '../ability/ability.decorator';
import { AbilitiesGuard, SkipAbilitiesGuard } from '../ability/ability.guard';
import { JwtGuard } from '../auth/guard';
import { ACTIONS, APP, SUBJECTS } from '../constants';
import { CreateRoleDto, EditRoleDto } from './dto';
import { RolesService } from './roles.service';

@Controller('roles')
@ApiTags('Roles & Permissions')
@ApiBearerAuth(APP.JWT_BEARER)
@UseGuards(JwtGuard, AbilitiesGuard)
export class RolesController {
  constructor(private roleService: RolesService) {}

  @CheckAbilities({ action: ACTIONS.CREATE, subject: SUBJECTS.ROLE })
  @Post()
  async createRole(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  //@CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.PERMISSION })
  @SkipAbilitiesGuard()
  @Get('permissions')
  listPermissions() {
    console.log('ssss');
    return this.roleService.listPermissions();
  }

  @CheckAbilities({ action: ACTIONS.UPDATE, subject: SUBJECTS.ROLE })
  @Patch(':id')
  updateRole(@Param('id') id: number, @Body() dto: EditRoleDto) {
    return this.roleService.update(+id, dto);
  }

  @CheckAbilities({ action: ACTIONS.DELETE, subject: SUBJECTS.ROLE })
  @Delete(':name')
  deleteRole(@Param('name') name: string) {
    return this.roleService.delete(name);
  }

  @CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.ROLE })
  @Get()
  listRoles() {
    return this.roleService.list();
  }

  @CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.ROLE })
  @Get(':name')
  getRole(@Param('name') name: string) {
    return this.roleService.getRoleByName(name, true);
  }

  @CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.PERMISSION })
  @Get(':name/permissions')
  listPermsByRole(@Param('name') name: string) {
    return this.roleService.listPermissionsByRole(name);
  }
}
