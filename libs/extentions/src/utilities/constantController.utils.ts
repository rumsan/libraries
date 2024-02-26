import { ControllerFunction } from '@rumsan/sdk/types';
import { ConstantControllers } from '../constants';
import { RSE } from '../exceptions';

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

export const addConstantController = (controllers: {
  [key: string]: ControllerFunction;
}) => {
  Object.keys(controllers).forEach((key) => {
    ConstantControllers[key.toLowerCase()] = controllers[key];
  });
};
