import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserInterface } from '../interfaces/current-user.interface';

export const CurrentUser = createParamDecorator(
  (data: undefined, ctx: ExecutionContext): CurrentUserInterface => {
    //(ctx: ExecutionContext): CurrentUserInterface => {
    const request = ctx.switchToHttp().getRequest();
    // if (data) {
    //   return request.user[data];
    // }
    return request.user;
  },
);

export const CU = CurrentUser;
