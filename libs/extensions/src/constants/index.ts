import { ControllerFunction } from '@rumsan/sdk/types';
import { ERRORS } from '../exceptions';

export const ConstantControllers: { [key: string]: ControllerFunction } = {
  errors: ERRORS.list,
};

export const PROTECTED_SETTINGS = 'PROTECTED';
