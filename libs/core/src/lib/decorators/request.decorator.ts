import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TRequestDetails } from '../types/request.types';

export const RequestDetails = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const ip = request.connection.remoteAddress;
    const userAgent = request.headers['user-agent'];
    const details: TRequestDetails = {
      ip,
      userAgent,
    };
    return details;
  },
);
