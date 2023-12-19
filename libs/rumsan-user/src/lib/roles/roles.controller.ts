import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import {
	CreatePermissionDto,
	CreateRoleDto,
	EditRoleDto,
	UpdatePermissionDto,
} from './dto';
import { CheckAbilities } from '../ability/ability.decorator';
import { JwtGuard } from '../auth/guard';
import { AbilitiesGuard } from '../ability/ability.guard';
import { ACTIONS, SUBJECTS } from '../constants';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('roles')
@ApiTags('Roles & Permissions')
@ApiBearerAuth()
@UseGuards(JwtGuard, AbilitiesGuard)
export class RolesController {
	constructor(private roleService: RolesService) {}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.CREATE, subject: SUBJECTS.ROLE })
	@Post()
	createRole(@Body() dto: CreateRoleDto) {
		return this.roleService.createRole(dto);
	}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.UPDATE, subject: SUBJECTS.ROLE })
	@Patch(':id')
	editUser(@Param('id') id: number, @Body() dto: EditRoleDto) {
		return this.roleService.updateRole(+id, dto);
	}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.DELETE, subject: SUBJECTS.ROLE })
	@Delete(':id')
	deleteRole(@Param('id') id: number) {
		return this.roleService.deleteRole(+id);
	}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.ROLE })
	@Get()
	listRoles() {
		return this.roleService.listRoles();
	}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.ROLE })
	@Get(':roleId')
	getRole(@Param('roleId') roleId: number) {
		return this.roleService.getRoleById(roleId);
	}

	// ============Permission Routes=======
	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.CREATE, subject: SUBJECTS.PERMISSION })
	@Post('perms')
	createPermission(@Body() dto: CreatePermissionDto) {
		return this.roleService.createPermission(dto);
	}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.PERMISSION })
	@Get('perms')
	listPermissions() {
		return this.roleService.listPermissions();
	}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.PERMISSION })
	@Get(':roleId/perms')
	listPermsByRole(@Param('roleId') roleId: number) {
		return this.roleService.listPermissionsByRole(+roleId);
	}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.UPDATE, subject: SUBJECTS.PERMISSION })
	@Patch(':permId/perms')
	updatePermission(
		@Param('permId') permId: number,
		@Body() dto: UpdatePermissionDto,
	) {
		return this.roleService.updatePermission(+permId, dto);
	}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.DELETE, subject: SUBJECTS.PERMISSION })
	@Delete(':permId/perms')
	deletePermission(@Param('permId') permId: number) {
		return this.roleService.deletePermission(+permId);
	}
}
