export { ERRORS } from './errors';
export * from './events';

// For Ability Guard
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
