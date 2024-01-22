import { Global, Module } from '@nestjs/common';
import { QueueOptions } from 'bullmq';
import { IQueueModuleOptions } from './interface/queue-config.interfaces';
import { QueueService } from './queue.service';
import { BullMQTransport } from './transports/bull';

@Global()
@Module({})
export class QueueModule {
  static forRoot<
    U = IQueueModuleOptions['config'],
    V = IQueueModuleOptions['transport'],
  >(rootConfig: IQueueModuleOptions<U, V>) {
    const Transport =
      rootConfig.transport ||
      new BullMQTransport(
        rootConfig.config as { queueName: string } & WorkerOptions &
          QueueOptions,
      );
    return {
      module: QueueModule,
      providers: [
        {
          provide: 'TRANSPORT',
          useFactory: () => Transport,
        },
        QueueService,
      ],
      exports: ['TRANSPORT', QueueService],
    };
  }
}
