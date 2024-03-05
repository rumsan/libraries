import {
  Global,
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '../../../config';
import {
  Logger,
  LoggerBaseKey,
  LoggerKey,
  WinstonLoggerTransportsKey,
} from '../../domain';
import LoggerService from '../../domain/logger.service';
import ConsoleTransport from '../winston/transports/consoleTransport';
import FileTransport from '../winston/transports/fileTransport';
import SlackTransport from '../winston/transports/slackTransport';
import { WinstonLogger } from '../winston/winston.logger';
import NestjsLoggerServiceAdapter from './nestjsLoggerServiceAdapter';
import morgan = require('morgan');

@Global()
@Module({

  imports: [ConfigModule],
  controllers: [],
  providers: [
    {
      provide: LoggerBaseKey,
      useClass: WinstonLogger,
    },
    {
      provide: LoggerKey,
      useClass: LoggerService,
    },
    {
      provide: NestjsLoggerServiceAdapter,
      useFactory: (logger: Logger) => new NestjsLoggerServiceAdapter(logger),
      inject: [LoggerKey],
    },
    {
      provide: WinstonLoggerTransportsKey,
      useFactory: (configService: ConfigService) => {
        const transports = [];

        transports.push(ConsoleTransport.createColorize());
        transports.push(FileTransport.create());
        console.log(`here is the config service`)
        console.log(configService?.isProduction)
        if (configService.isProduction) {
          console.log({ configService })
          if (configService.slackWebhookUrl) {

            console.log(configService?.slackWebhookUrl)
            transports.push(
              SlackTransport.create(configService.slackWebhookUrl),
            );
          }
        }

        return transports;
      },
      inject: [ConfigService],
    },
  ],
  exports: [LoggerKey, NestjsLoggerServiceAdapter],
})
export class LoggerModule implements NestModule {
  public constructor(
    @Inject(LoggerKey) private logger: Logger,
    private configService: ConfigService,
  ) { }

  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(
        morgan(this.configService.isProduction ? 'combined' : 'dev', {
          stream: {
            write: (message: string) => {
              this.logger.debug(message, {
                sourceClass: 'RequestLogger',
              });
            },
          },
        }),
      )
      .forRoutes('*');
  }
}
