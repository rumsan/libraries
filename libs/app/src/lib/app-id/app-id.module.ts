import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppIdInterceptor } from './app-id.interceptor';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AppIdInterceptor,
    },
  ],
})
export class AppIdModule {}
