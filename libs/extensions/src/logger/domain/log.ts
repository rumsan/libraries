export enum LogLevel {
  Emergency = 'emergency',
  Fatal = 'fatal',
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
}

export interface LogData {
  organization?: string;
  context?: string;
  app?: string;
  sourceClass?: string;
  correlationId?: string;
  error?: Error;
  props?: NodeJS.Dict<any>;
}
