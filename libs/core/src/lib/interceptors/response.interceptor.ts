import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  meta?: unknown;
  code?: string;
  data: T | null;
}

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    if (request.query.raw) return next.handle();

    return next.handle().pipe(
      map((retData) => {
        const resData: Response<T> = {
          success: true,
          data: null,
        };
        if (retData === null) retData = { data: null };
        const { meta, data, code, ...rest } = retData;
        typeof data === 'undefined' || data === null
          ? (resData.data = Object.keys(rest).length === 0 ? null : rest)
          : (resData.data = data);
        if (
          typeof retData === 'string' ||
          typeof retData === 'number' ||
          typeof retData === 'boolean' ||
          Array.isArray(retData)
        )
          resData.data = retData as T;
        resData.meta = meta;
        resData.code = code;

        return resData;
      }),
    );
  }
}
