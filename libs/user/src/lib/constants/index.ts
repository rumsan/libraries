export { ERRORS_RSUSER } from './errors';
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
export const SUBJECTS: any = {
  ALL: 'all',
  USER: 'user',
  ROLE: 'role',
};

export const APP = {
  JWT_BEARER: 'JWT',
};
