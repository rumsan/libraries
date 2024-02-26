import { RSErrorInfo } from '@rumsan/sdk/types';

export class RSError extends Error {
  public httpCode: number;
  public type: string;
  public srcModule?: string;
  public meta?: any;
  constructor(
    errorInfo: RSErrorInfo = {
      name: 'UNKNOWN',
      message: 'Unknown error',
      type: 'RSERROR',
      httpCode: 500,
      meta: {},
    },
  ) {
    super(errorInfo.message);
    this.name = errorInfo.name.toUpperCase() || 'UNKNOWN';
    this.httpCode = errorInfo.httpCode || 500;
    this.type = errorInfo.type?.toUpperCase() || 'RSERROR';
    this.srcModule = errorInfo.srcModule;
    this.meta = errorInfo.meta;
  }
}

export function RSE(
  message: string,
  name: string = 'UNKNOWN',
  httpCode: number = 500,
  type: string = 'RSERROR',
) {
  return new RSError({ message, name, httpCode, type, srcModule: 'RS_CORE' });
}

export const ERRORS: any = {
  register: (errors: { [key: string]: RSError }) => {
    Object.keys(errors).forEach((key) => {
      ERRORS[key] = errors[key];
    });
  },
  list: () => {
    const result: {
      [key: string]: {
        name: string;
        message: string;
        httpCode: number;
        sourceModule?: string;
        meta?: any;
        type: string;
      };
    } = {};
    Object.keys(ERRORS).forEach((key) => {
      if (typeof ERRORS[key] === 'function') return;
      result[key] = {
        name: ERRORS[key].name,
        message: ERRORS[key].message,
        meta: ERRORS[key].meta,
        httpCode: ERRORS[key].httpCode,
        sourceModule: ERRORS[key].srcModule || 'UNKNOWN',
        type: ERRORS[key].type,
      };
    });
    return result;
  },

  NO_MATCH_IP: RSE('IP address does not match', 'NO_MATCH_IP', 403),
  NO_MATCH_OTP: RSE('OTP does not match', 'NO_MATCH_OTP', 403),

  NOT_JSON: RSE('Invalid JSON string', 'NOT_JSON', 400),
  NOT_IMPLEMENTED: RSE('Not implemented', 'NOT_IMPLEMENTED', 501),
};
