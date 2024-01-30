// queue.module.ts

import { DynamicModule, Global, Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { BullMqService } from './transports/bull';

@Global()
@Module({})
export class QueueModule {
  private static transport: any = BullMqService;
  private static options: any = {};

  static forRoot(options: any): DynamicModule {
    const Transport = options.transport || QueueModule.transport;

    return {
      module: QueueModule,
      imports: [...options.imports],
      global: options.isGlobal,
      providers: [
        {
          provide: 'TRANSPORT',
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory(...args);
            this.options = config.config;
            this.transport = Transport;
          },
          inject: options.inject,
        },
        QueueService,
        ...(options.providers || []),
      ],
      exports: ['TRANSPORT', QueueService],
    };
  }

  static registerQueue(options: Record<string, any>): DynamicModule {
    console.log('this.options', this.options);
    return {
      module: QueueModule,
      providers: [
        {
          provide: 'TRANSPORT',
          useFactory(...args) {
            console.log('args', args);
            return new QueueModule.transport({
              ...options,
              ...QueueModule.options,
            });
          },
          // useValue: new QueueModule.transport({
          //   ...options,
          //   ...QueueModule.options,
          // }),
        },
        QueueService,
      ],
      exports: [QueueService],
    };
  }
}
