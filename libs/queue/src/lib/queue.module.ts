// queue.module.ts

import { DynamicModule, Global, Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { BullMqService } from './transports/bull';

@Global()
@Module({})
export class QueueModule {
  private static transport: any = BullMqService;

  static forRoot(options: any): DynamicModule {
    return {
      module: QueueModule,
      providers: [
        {
          provide: 'QUEUE_CONFIG',
          useFactory: async (...args: any[]) => {
            const config = options.useFactory
              ? await options?.useFactory(...args)
              : options.config;
            return config;
          },
          inject: options.inject,
        },
      ],
      exports: ['QUEUE_CONFIG'],
    };
  }

  static registerQueue(options: Record<string, any>): DynamicModule {
    return {
      module: QueueModule,
      providers: [
        {
          provide: 'TRANSPORT',
          useFactory: (config) => {
            return new QueueModule.transport({
              ...options,
              ...config,
            });
          },
          inject: ['QUEUE_CONFIG'],
        },
        QueueService,
      ],
      exports: ['TRANSPORT', QueueService],
    };
  }
}
