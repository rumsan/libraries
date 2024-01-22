import { QueueOptions, WorkerOptions } from 'bullmq';
import { TransportInterface } from './transport.interface';

export interface IQueueModuleOptions<
  U extends { queueName: string } & WorkerOptions & QueueOptions = {
    queueName: string;
  } & WorkerOptions &
    QueueOptions,
  V extends TransportInterface = TransportInterface,
> {
  config: U;
  transport?: V;
}
