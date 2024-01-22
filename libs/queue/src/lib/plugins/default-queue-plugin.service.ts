import { Injectable } from '@nestjs/common';
import { QueuePlugin } from './queue-plugin.interface';

@Injectable()
export class DefaultQueuePluginService<T> implements QueuePlugin<T> {
  beforeEnqueue(item: T): T {
    // You can customize the behavior before enqueueing
    return item;
  }

  afterDequeue(item: T): void {
    // You can customize the behavior after dequeuing
  }
}
