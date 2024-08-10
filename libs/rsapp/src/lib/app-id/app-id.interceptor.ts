import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AppIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const appId = request.headers['app-id'];
    if (appId) {
      request['appId'] = appId;
    }
    return next.handle().pipe(
      tap(() => {
        // You can add any additional logic here if needed
      }),
    );
  }
}
