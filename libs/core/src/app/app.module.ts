import { DynamicModule, Global, Module } from '@nestjs/common';
import { ERRORS } from '../exceptions';
import { RSE } from '../exceptions/rs-errors';
import { RumsanAppController } from './app.controller';

type ControllerFunction = () => any;

export const ConstantControllers: { [key: string]: ControllerFunction } = {
  errors: ERRORS.list,
};

export const getConstantController = (name: string) => {
  name = name.toLowerCase();
  const registeredControllers = Object.keys(ConstantControllers);
  if (!registeredControllers.includes(name)) {
    throw RSE(
      `Constant controller named [${name}] has not been registered. Allowed values are [${registeredControllers.join(
        ',',
      )}].`,
      'RS_CORE:NO_CONSTANT_CONTROLLER',
    );
  }
  return ConstantControllers[name]();
};

const addConstantController = (controllers: {
  [key: string]: ControllerFunction;
}) => {
  Object.keys(controllers).forEach((key) => {
    ConstantControllers[key.toLowerCase()] = controllers[key];
  });
};

@Global()
@Module({})
export class RumsanAppModule {
  static forRoot(options?: {
    controllers?: { [key: string]: ControllerFunction };
  }): DynamicModule {
    const { controllers } = options || {};
    addConstantController(controllers || {});

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
