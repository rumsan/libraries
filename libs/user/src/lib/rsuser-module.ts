import {
  DynamicModule,
  Global,
  Module,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { RSExceptionModule } from '@rumsan/extensions/exceptions';
import { RS_AUTH_THROTTLERS } from './auths/throttle/auth-throttle';
import { assertTrustProxyConfigured } from './auths/throttle/trust-proxy.check';
import { ERRORS } from './constants';

export interface RSUserModuleOptions {
  /** Rate limit config for auth routes (required, defaults to RS_AUTH_THROTTLERS). */
  throttler?: ThrottlerModuleOptions;
}

@Global()
@Module({})
export class RSUserModule implements OnApplicationBootstrap {
  constructor(private readonly adapterHost: HttpAdapterHost) {}

  onApplicationBootstrap() {
    assertTrustProxyConfigured(this.adapterHost.httpAdapter);
  }

  static forRoot(
    modules: any[],
    options: RSUserModuleOptions = {},
  ): DynamicModule {
    modules.map((module) => {
      let moduleName = module?.module?.name;
      if (!moduleName) {
        moduleName = module?.name;
      }
      if (!moduleName)
        throw new Error('Not a valid module passed to RSUserModule.forRoot()');

      if (
        moduleName === 'UsersModule' ||
        moduleName === 'AuthsModule' ||
        moduleName === 'RolesModule' ||
        moduleName === 'SignupModule'
      ) {
        return module;
      } else {
        throw new Error(
          'Only UsersModule, AuthsModule, RolesModule, SignupModule are allowed to be passed to RSUserModule.forRoot()',
        );
      }
    });

    return {
      module: RSUserModule,
      imports: [
        //SignupModule.forRoot({ autoApprove: false }),
        RSExceptionModule.forRoot({ errorSet: ERRORS }),
        ThrottlerModule.forRoot(options.throttler ?? RS_AUTH_THROTTLERS),
        // RumsanAppModule.forRoot({
        //   controllers: {
        //     subjects: AbilitySubject.list,
        //   },
        // }),
        ...modules,
      ],
    };
  }
}
