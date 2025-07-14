import { RSError } from '@rumsan/extensions/exceptions';

export function RSE(
  message: string,
  name: string = 'UNKNOWN',
  httpCode: number = 500,
  meta?: any,
) {
  return new RSError({ message, name, httpCode, srcModule: 'RS_USER', meta });
}

export const ERRORS = {
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
  USER_EMAIL_EXISTS: RSE('User with this email already exists.', 'USER_EMAIL_EXISTS', 409),
  USER_PHONE_EXISTS: RSE('User with this phone number already exists.', 'USER_PHONE_EXISTS', 409),
  USER_WALLET_EXISTS: RSE('User with this wallet address already exists.', 'USER_WALLET_EXISTS', 409),
  AUTH_SERVICE_EXISTS: RSE('Authentication service already exists for this user.', 'AUTH_SERVICE_EXISTS', 409),
  AUTH_EMAIL_EXISTS: RSE('This email is already registered with another user.', 'AUTH_EMAIL_EXISTS', 409),
  AUTH_PHONE_EXISTS: RSE('This phone number is already registered with another user.', 'AUTH_PHONE_EXISTS', 409),
  AUTH_WALLET_EXISTS: RSE('This wallet address is already registered with another user.', 'AUTH_WALLET_EXISTS', 409),
  INVALID_CHALLENGE: RSE('Invalid challenge provided.', 'INVALID_CHALLENGE', 400),
  IP_MISMATCH: RSE('IP address mismatch in challenge.', 'IP_MISMATCH', 400),
  INVALID_SERVICE: RSE('Invalid service type detected.', 'INVALID_SERVICE', 400),
  USER_DELETE_FAILED: RSE('User not found or deletion not permitted.', 'USER_DELETE_FAILED', 400),
};
