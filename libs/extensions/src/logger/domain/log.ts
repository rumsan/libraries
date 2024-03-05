export enum LogLevel {
  Emergency = 'emergency',
  Fatal = 'fatal',
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
}

export interface Log {
  timestamp: number;
  level: LogLevel;
  message: string;
  data: LogData;
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

export const ContextStorageServiceKey = 'CONTEXT_STORAGE_SERVICE_KEY';

export interface ContextStorageService {
  setContextId(contextId: string): void;
  getContextId(): string;
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
}
