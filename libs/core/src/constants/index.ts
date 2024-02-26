import { ERRORS } from '../exceptions';
import { ControllerFunction } from '../types';

export const ConstantControllers: { [key: string]: ControllerFunction } = {
  errors: ERRORS.list,
};
