import { Inject, Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { LogLevel, WinstonLoggerTransportsKey } from '../../domain';

@Injectable()
export class WinstonLogger {
    private logger: winston.Logger;

    public constructor(
        @Inject(WinstonLoggerTransportsKey) transports: winston.transport[],
    ) {
        this.logger = winston.createLogger(this.getLoggerFormatOptions(transports));
    }

    private getLoggerFormatOptions(transports: winston.transport[]) {
        const levels: any = {};
        let cont = 0;

        Object.values(LogLevel).forEach((level) => {
            levels[level] = cont;
            cont++;
        });

        return {
            level: LogLevel.Debug,
            levels: levels,
            format: winston.format.combine(
                // Add timestamp and format the date
                winston.format.timestamp({
                    format: 'DD/MM/YYYY, HH:mm:ss',
                }),
                // Errors will be logged with stack trace
                winston.format.errors({ stack: true }),
                // Add custom Log fields to the log
                winston.format((info, opts) => {
                    // Info contains an Error property
                    if (info['error'] && info['error'] instanceof Error) {
                        info['stack'] = info['error'].stack;
                        info['error'] = undefined;
                    }

                    info['label'] = `${info['organization']}.${info['context']}.${info['app']}`;

                    return info;
                })(),
                // Add custom fields to the data property
                winston.format.metadata({
                    key: 'data',
                    fillExcept: ['timestamp', 'level', 'message'],
                }),
                // Format the log as JSON
                winston.format.json(),
            ),
            transports: transports,
            exceptionHandlers: transports,
            rejectionHandlers: transports,
        };
    }
}
