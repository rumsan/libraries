import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserInterface } from '@rumsan/sdk/interfaces';

export const CurrentUser = createParamDecorator(
  (data: undefined, ctx: ExecutionContext): CurrentUserInterface => {
    //(ctx: ExecutionContext): CurrentUserInterface => {
    const request = ctx.switchToHttp().getRequest();
    // if (data) {
    //   return request.user[data];
    // }
    console.log(request.user);
    return request.user;
  },
);

export const CU = CurrentUser;
