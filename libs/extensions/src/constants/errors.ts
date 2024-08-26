import { RSError } from '../exceptions';

export function RSE(
  message: string,
  name = 'UNKNOWN',
  httpCode = 500,
  meta?: any,
) {
  return new RSError({ message, name, httpCode, srcModule: 'RS_USER', meta });
}

export const RSERRORS = {
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
  SERVICE_TYPE_INVALID: RSE(
    'Invalid service type. Valid types are {{types}}.',
    'SERVICE_TYPE_INVALID',
    400,
    { types: 'wallet, email, phone' },
  ),
  USER_NOT_FOUND: RSE('User not found.', 'USER_NOT_FOUND', 404),
};
