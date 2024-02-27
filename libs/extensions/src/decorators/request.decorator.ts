import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from '@rumsan/sdk/types';

export const RequestDetails = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const ip = request.connection.remoteAddress;
    const userAgent = request.headers['user-agent'];
    const origin = request.headers['origin'];
    const details: Request = {
      ip,
      userAgent,
      origin,
    };
    return details;
  },
);
