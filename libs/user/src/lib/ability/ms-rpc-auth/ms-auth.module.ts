import { Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MicroserviceAuthGuard } from './ms-auth.guard';

@Module({
  providers: [MicroserviceAuthGuard, Reflector],
  exports: [MicroserviceAuthGuard, Reflector],
})
export class MicroserviceAuthModule {}
