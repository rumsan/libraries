import {
  ArgumentMetadata,
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  PipeTransform,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PrimsaFriendlyErrorMessage } from './prisma-exceptions';
import { RSError } from './rs-errors';

@Catch()
export class RsExceptionFilter implements PipeTransform<any>, ExceptionFilter {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = this.getErrorMessage(errors);
      throw new BadRequestException({
        message: 'Validation failed.',
        errors: messages,
        status: 400,
      });
    }
    return value;
  }

  private toValidate(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private getErrorMessage(errors: any): Record<string, any> {
    const result: Record<string, any> = {};
    errors.forEach((error: any) => {
      const constraints = error.constraints;
      if (constraints) {
        const property = error.property;
        result[property] = Object.values(constraints);
      }
    });

    return result;
  }
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    let exceptionResponse: any;

    const responseData: {
      success: boolean;
      name: string;
      message: string | string[];
      meta?: any;
      statusCode: HttpStatus;
      sourceModule: string | null;
      errors?: any;
      type: string;
      timestamp: number;
    } = {
      success: false,
      name: 'DEFAULT',
      message:
        'Our server is not happy. It threw an error. Please try again or contact support.' ||
        '',
      meta: {},
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      sourceModule: null,
      type: 'ERROR',
      timestamp: new Date().getTime(),
    };

    function isObjectWithErrors(value: any): value is { errors: any[] } {
      return typeof value === 'object' && value !== null && 'errors' in value;
    }

    if (exception instanceof HttpException) {
      exceptionResponse = exception?.getResponse();

      if (isObjectWithErrors(exceptionResponse)) {
        responseData.errors = exceptionResponse?.errors ?? '';
      } else {
        responseData.errors = [response?.errors ?? ''];
      }
      responseData.name = exception.name;
      responseData.statusCode = exceptionResponse.statusCode;
      responseData.message = exceptionResponse.message;
      responseData.type = 'HTTP';
      //console.log('HttpException occured', responseData);
    } else if (exception instanceof RSError) {
      // exceptionResponse = exception?.getResponse();

      if (isObjectWithErrors(exceptionResponse)) {
        responseData.errors = exceptionResponse?.errors ?? '';
      } else {
        responseData.errors = [response?.errors ?? ''];
      }
      responseData.message = exception.message;
      responseData.statusCode = exception.httpCode;
      responseData.name = exception.name;
      responseData.meta = exception.meta;
      responseData.type = 'RSERROR';
      responseData.sourceModule = exception.srcModule || null;
      //console.log('RS Exception occured', responseData);
      // eslint-disable-next-line no-unsafe-optional-chaining
    } else if (exception instanceof Prisma?.PrismaClientKnownRequestError) {
      responseData.name = exception.code;
      //responseData.errors = exception.errors;
      const prismaError = PrimsaFriendlyErrorMessage(exception);
      responseData.message = prismaError.message;
      responseData.statusCode = prismaError.httpCode;
      responseData.type = 'DBERROR';
      //console.log('Prisma Error occured:', responseData);
    } else if (exception instanceof Error) {
      responseData.name = exception.name;
      responseData.message = exception.message;
    } else if (typeof exception === 'string') {
      responseData.message = exception;
    }

    response.status(responseData.statusCode).json(responseData);
  }
}
