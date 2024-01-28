import { RSError } from '@rumsan/core';

export function RSE(
  message: string,
  name: string = 'UNKNOWN',
  httpCode: number = 500,
  type: string = 'APP',
) {
  return new RSError({ message, name, httpCode, type, srcModule: 'APP' });
}

export const ERRORS = {
  NO_MATCH_IP: RSE('IP address does not match', 'NO_MATCH_IP', 403),
  SAMPLE_ERROR: RSE('Sample error', 'SAMPLE_ERROR', 400),
};
