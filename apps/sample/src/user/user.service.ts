import { Injectable } from '@nestjs/common';
import { UserService } from '@rumsan/user';

const USER_ROLE_ID = 3;

@Injectable()
export class AppUserService {
  constructor(private readonly userService: UserService) {}
  async Test(dto: any) {
    return this.userService.getById(2);
    return {};
  }
}
