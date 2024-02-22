import { DynamicModule, Global, Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SUBJECTS } from '../constants';
import { AbilitiesGuard } from './ability.guard';
import { AbilitySubject } from './ability.subjects';

@Global()
@Module({
  providers: [AbilitiesGuard, Reflector],
})
export class AbilityModule {
  static forRoot(options?: {
    subjects?: { [key: string]: string };
  }): DynamicModule {
    const { subjects } = options || {};
    AbilitySubject.add(subjects || {});

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
