import { RSError } from '@rumsan/core';

export function RSE(
  message: string,
  name: string = 'UNKNOWN',
  httpCode: number = 500,
  meta?: any,
) {
  return new RSError({ message, name, httpCode, srcModule: 'RS_USER', meta });
}

export const ERRORS_RSUSER = {
  ROLE_NAME_INVALID: RSE(
    'Invalid characters in role name.',
    'ROLE_NAME_INVALID',
    400,
  ),
  PERMISSION_SET_INVALID: RSE(
    'Invalid permission set. Valid actions are {{actions}}.',
    'PERMISSION_SET_INVALID',
    400,
    { actions: 'manage, create, read, update, delete' },
  ),
};
