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
    // Get the request object
    const request = context.switchToHttp().getRequest();
    // Extract the 'app-id' header from the incoming request
    const appId = request.headers['app-id'];

    // If 'app-id' header exists, attach it to the request object
    if (appId) {
      request['appId'] = appId;
    }

    // Pass the request to the next handler in the request-response cycle
    return next.handle().pipe(
      tap(() => {
        // Optionally, you can add additional logic here (e.g., logging, modifying response, etc.)
      }),
    );
  }
}
