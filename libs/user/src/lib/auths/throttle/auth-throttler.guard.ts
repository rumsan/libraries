import { Injectable, Optional } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  InjectThrottlerOptions,
  InjectThrottlerStorage,
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerStorage,
} from '@nestjs/throttler';

/**
 * ThrottlerGuard for the auth routes. Rate limiting is required: if
 * ThrottlerModule is not registered (AuthsModule used without
 * RSUserModule.forRoot()), startup fails with a clear error instead of
 * Nest's generic dependency error.
 */
@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
  constructor(
    @Optional() @InjectThrottlerOptions() options: ThrottlerModuleOptions,
    @Optional() @InjectThrottlerStorage() storageService: ThrottlerStorage,
    reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  override async onModuleInit(): Promise<void> {
    if (!this.options || !this.storageService) {
      throw new Error(
        'Rate limiting is required for @rumsan/user auth routes, but ThrottlerModule is not registered. ' +
          'Import AuthsModule through RSUserModule.forRoot([...]).',
      );
    }
    return super.onModuleInit();
  }
}
