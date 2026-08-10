import { DynamicModule, Global, Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SUBJECTS } from '../constants';
import { AbilityAction } from './ability.actions';
import { AbilitiesGuard } from './ability.guard';
import { AbilitySubject } from './ability.subjects';

@Global()
@Module({
  providers: [AbilitiesGuard, Reflector],
})
export class AbilityModule {
  static forRoot(options?: {
    subjects?: { [key: string]: string };
    actions?: { [key: string]: string };
  }): DynamicModule {
    const { subjects, actions } = options || {};
    AbilitySubject.add(subjects || {});
    AbilityAction.add(actions || {});

    return {
      global: true,
      module: AbilityModule,
      providers: [
        {
          provide: 'SUBJECTS',
          useValue: SUBJECTS,
        },
        AbilitiesGuard,
        Reflector,
      ],
      exports: ['SUBJECTS', AbilitiesGuard, Reflector],
    };
  }
}
