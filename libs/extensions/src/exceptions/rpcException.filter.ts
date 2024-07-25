import {
  Catch,
  RpcExceptionFilter as RPCExceptionFilter,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library';
import { Observable, throwError } from 'rxjs';
import {
  handleClientKnownRequestError,
  handleClientUnknownRequestError,
} from './prisma.handler';

@Catch(Error)
export class RpcExceptionFilter implements RPCExceptionFilter<RpcException> {
  catch(exception: Error): Observable<any> {
    if (exception instanceof RpcException) {
      return throwError(() => new RpcException(exception.message));
    }

    if (exception instanceof PrismaClientKnownRequestError) {
      const error = handleClientKnownRequestError(exception);
      return throwError(() => new RpcException(error));
    }

    if (exception instanceof PrismaClientUnknownRequestError) {
      const error = handleClientUnknownRequestError(exception);
      return throwError(() => new RpcException(error));
    }

    return throwError(() => new RpcException(exception.message));
  }
}