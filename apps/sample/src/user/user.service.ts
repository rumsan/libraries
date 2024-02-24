import { Injectable } from '@nestjs/common';
import { UsersService } from '@rumsan/user';

const USER_ROLE_ID = 3;

@Injectable()
export class AppUsersService {
  constructor(private readonly userService: UsersService) {}
  async Test(dto: any) {
    return this.userService.getById(2);
    return {};
  }
}
