import { DynamicModule, Global, Module } from '@nestjs/common';
import { ERRORS, RSError } from './rs-errors';

@Global()
@Module({})
export class RSExceptionModule {
  static forRoot(options?: {
    errorSet?: { [key: string]: RSError };
  }): DynamicModule {
    const { errorSet } = options || {};
    ERRORS.register(errorSet || {});

    return {
      module: RSExceptionModule,
      providers: [
        {
          provide: 'ERRORS',
          useValue: ERRORS,
        },
      ],
      exports: ['ERRORS'],
    };
  }
}
