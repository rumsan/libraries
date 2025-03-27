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
    if (context.getType() === 'http') {
      this.handleHttpRequest(context);
    } else if (context.getType() === 'rpc') {
      this.handleRpcRequest(context);
    }

    return next.handle().pipe(
      tap(() => {
        // Optionally, add additional logic here (e.g., logging)
      }),
    );
  }

  private handleHttpRequest(context: ExecutionContext): void {
    const request = context.switchToHttp().getRequest();
    const appId = request.headers['app-id'];

    if (appId) {
      request['appId'] = appId;
    }
  }

  private handleRpcRequest(context: ExecutionContext): void {
    const data = context.switchToRpc().getData();

    const appId = data?.['app-id'];
    if (appId) {
      data['appId'] = appId;
    }

    const pattern = context.getHandler()?.name;
    if (pattern) {
      data['messagePattern'] = pattern;
    }
  }
}
