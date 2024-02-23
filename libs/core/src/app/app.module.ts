import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConstantControllers } from '../constants';
import { ControllerFunction } from '../types';
import { ConstantControllerUtils } from '../utilities';
import { RumsanAppController } from './app.controller';

@Global()
@Module({})
export class RumsanAppModule {
  static forRoot(options?: {
    controllers?: { [key: string]: ControllerFunction };
  }): DynamicModule {
    const { controllers } = options || {};
    ConstantControllerUtils.addConstantController(controllers || {});

    return {
      module: RumsanAppModule,
      controllers: [RumsanAppController],
      providers: [
        {
          provide: 'AppConstantControllers',
          useValue: ConstantControllers,
        },
      ],
      exports: ['AppConstantControllers'],
    };
  }
}
