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
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';
import { AbilitiesGuard } from '../ability/ability.guard';
import { CheckAbilities } from '../ability/ability.decorator';
import { ACTIONS, APP, SUBJECTS } from '../constants';
import { SignupDto } from '../auth/dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth(APP.JWT_BEARER)
@UseGuards(JwtGuard, AbilitiesGuard)
export class UserController {
	constructor(private userService: UserService) {}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.CREATE, subject: SUBJECTS.ROLE })
	@Post()
	createRole(@Body() dto: SignupDto) {
		return this.userService.createUser(dto);
	}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.USER })
	@Get('me')
	getMe(@GetUser() user: User) {
		// if (user.otp) delete user.otp;
		return user;
	}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.UPDATE, subject: SUBJECTS.USER })
	@Patch('profile')
	updateProfile(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
		return this.userService.updateProfile(+userId, dto);
	}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.USER })
	@Get('')
	listAll() {
		return this.userService.listUsers();
	}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.UPDATE, subject: SUBJECTS.USER })
	@Patch(':userId')
	editUser(@Param('userId') userId: number, @Body() dto: EditUserDto) {
		return this.userService.updateProfile(+userId, dto);
	}

	@HttpCode(HttpStatus.OK)
	@CheckAbilities({ action: ACTIONS.DELETE, subject: SUBJECTS.USER })
	@Delete(':userId')
	deleteUser(@Param('userId') userId: number) {
		return this.userService.deleteUser(+userId);
	}
}
