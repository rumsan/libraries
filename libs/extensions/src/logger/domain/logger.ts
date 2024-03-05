import { LogData, LogLevel } from '.';

export const LoggerBaseKey = 'LOGGER_BASE_KEY';
export const LoggerKey = 'LOGGER_KEY';
export const WinstonLoggerTransportsKey = 'WINSTON_LOGGER_TRANSPORTS_KEY';

export interface Logger {
  log(
    level: LogLevel,
    message: string | Error,
    data?: LogData,
    profile?: string,
  ): void;
  debug(message: string, data?: LogData, profile?: string): void;
  info(message: string, data?: LogData, profile?: string): void;
  warn(message: string | Error, data?: LogData, profile?: string): void;
  error(message: string | Error, data?: LogData, profile?: string): void;
  fatal(message: string | Error, data?: LogData, profile?: string): void;
  emergency(message: string | Error, data?: LogData, profile?: string): void;
  startProfile(id: string): void;
}
