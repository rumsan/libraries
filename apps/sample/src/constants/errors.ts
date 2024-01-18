import { RSError } from '@rumsan/core';

export function RSE(
  message: string,
  name: string = 'UNKNOWN',
  httpCode: number = 500,
  type: string = 'RSERROR',
) {
  return new RSError({ message, name, httpCode, type, srcModule: 'APP' });
}

export const ERRORS = {
  SSS_NO_MATCH_IP: RSE('SSS IP address does not match', 'NO_MATCH_IP', 403),
};
