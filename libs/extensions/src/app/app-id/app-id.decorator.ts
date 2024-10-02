import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AppId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['rs-app-id'];
  },
);
