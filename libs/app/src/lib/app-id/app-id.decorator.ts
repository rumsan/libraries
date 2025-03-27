import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AppId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    if (ctx.getType() === 'http') {
      const request = ctx.switchToHttp().getRequest();
      return request.headers['app-id'];
    } else if (ctx.getType() === 'rpc') {
      const data = ctx.switchToRpc().getData();
      return data['app-id'];
    }
    return null;
  },
);
