import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestContext } from '@rumsan/sdk/types';

export const GetRequestContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const ip = request.connection.remoteAddress;
    const userAgent = request.headers['user-agent'];
    const origin = request.headers['origin'];
    const user = request.user;
    const details: RequestContext = {
      ip,
      userAgent,
      origin,
      currentUserId: user?.id.toString(),
      currentUser: user,
    };
    return details;
  },
);

export const xRC = GetRequestContext;
