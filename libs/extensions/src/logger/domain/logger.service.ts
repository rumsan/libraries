import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INQUIRER } from '@nestjs/core';
import {
    LogData,
    LogLevel
} from './log';
import { Logger, LoggerBaseKey } from './logger';

export default class LoggerService implements Logger {
    private sourceClass: string;
    private organization: string;
    private context: string;
    private app: string;

    public constructor(
        @Inject(LoggerBaseKey) private logger: Logger,
        configService: ConfigService,
        @Inject(INQUIRER) parentClass: object,

    ) {
        this.sourceClass = parentClass?.constructor?.name;
        this.organization =
            configService?.get<string>('ORGANIZATION') ?? 'ORGANIZATION';
        this.context = configService?.get<string>('CONTEXT') ?? 'CONTEXT';
        this.app = configService?.get<string>('APP') ?? 'APP';
    }

    public log(
        level: LogLevel,
        message: string | Error,
        data: LogData,
        profile?: string,
    ): void {
        return this.logger.log(level, message, this.getLogData(data), profile);
    }

    public debug(message: string, data?: LogData, profile?: string) {
        return this.logger.debug(message, this.getLogData(data), profile);
    }

    public info(message: string, data?: LogData, profile?: string) {
        return this.logger.info(message, this.getLogData(data), profile);
    }

    public warn(message: string | Error, data?: LogData, profile?: string) {
        return this.logger.warn(message, this.getLogData(data), profile);
    }

    public error(message: string | Error, data?: LogData, profile?: string) {
        return this.logger.error(message, this.getLogData(data), profile);
    }

    public fatal(message: string | Error, data?: LogData, profile?: string) {
        return this.logger.fatal(message, this.getLogData(data), profile);
    }

    public emergency(
        message: string | Error,
        data?: LogData | undefined,
        profile?: string | undefined,
    ) {
        return this.logger.emergency(message, this.getLogData(data), profile);
    }

    private getLogData(data?: LogData): LogData {
        return {
            ...data,
            organization: data?.organization || this.organization,
            context: data?.context || this.context,
            app: data?.app || this.app,
            sourceClass: data?.sourceClass || this.sourceClass,

        };
    }

    public startProfile(id: string): void {
        this.logger.startProfile(id);
    }
}
