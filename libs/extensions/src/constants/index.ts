import { ControllerFunction } from '@rumsan/sdk/types';
import { ERRORS } from '../exceptions';

export const ConstantControllers: { [key: string]: ControllerFunction } = {
  errors: ERRORS.list,
};

export const PROTECTED_SETTINGS = 'PROTECTED';

export { RSE, RSERRORS } from './errors';
export * from './events';

//For Ability Guard
export const ACTIONS = {
  MANAGE: 'manage',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  READ: 'read',
};

// For Ability Guard
export const SUBJECTS = {
  ALL: 'all',
  PUBLIC: 'public',
  USER: 'user',
  ROLE: 'role',
};

export const APP = {
  JWT_BEARER: 'JWT',
};

export const CLIENT_TOKEN_LIFETIME = 600;

export const IS_PUBLIC_KEY = 'isPublic';

export const NOT_AVAILABLE = 'N/A';
