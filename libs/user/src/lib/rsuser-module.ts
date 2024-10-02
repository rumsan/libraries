import { DynamicModule, Global, Module } from '@nestjs/common';
// import { RumsanAppModule } from '@rumsan/extensions/apps';
// import { AbilitySubject } from './ability/ability.subjects';
import { RSExceptionModule } from '@rumsan/extensions/exceptions';
import { ERRORS } from './constants';

@Global()
@Module({})
export class RSUserModule {
  static forRoot(modules: any[]): DynamicModule {
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
