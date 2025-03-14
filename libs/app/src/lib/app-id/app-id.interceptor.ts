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
    // Check if the context is HTTP-based to extract the appId
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      const appId = request.headers['app-id'];

      if (appId) {
        request['appId'] = appId;
      }
    }
    // Check if the context is message-based (e.g., Redis, Kafka)
    if (context.getType() === 'rpc') {
      const data = context.switchToRpc().getData();
      const appId = data?.['app-id'];

      if (appId) {
        data['appId'] = appId;
      }
    }

    // Pass the request/message to 
    // the next handler
    return next.handle().pipe(
      tap(() => {
        // Optionally, add additional logic here (e.g., logging)
      }),
    );
  }
}
