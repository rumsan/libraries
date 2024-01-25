import { Queue, Worker, WorkerOptions } from 'bullmq';
import { IQueueModuleOptions } from '../../interface/queue-config.interfaces';
import { TransportInterface } from '../../interface/transport.interface';

export class BullMQTransport implements TransportInterface {
  private queue: Queue;
  private worker: Worker;

  constructor(private config: IQueueModuleOptions['config']) {}

  async connect() {
    this.queue = new Queue(this.config.queueName, this.config);
    this.worker = new Worker(
      this.config.queueName as string,
      async (job) => {
        // This is where you process your jobs
        console.log('processing job', job.name, job.data);
      },
      this.config as WorkerOptions,
    );
  }

  async sendMessage(queue: string, data: unknown) {
    console.log('sending message to bullmq', queue, data);
    await this.queue.add(queue, data);
  }

  async receiveMessage(
    queue: string,
    callback: (data: unknown, job: unknown, worker: Worker) => void,
  ) {
    console.log('receiving message from bullmq', queue);

    this.queue.

    const worker = new Worker(
      queue,
      async (job: any) => {
        console.log('processing job', job.name, job.data, job);
        callback(job.data, job, worker);
      },
      this.config as WorkerOptions,
    );

    worker.on('failed', (job, err) => {
      console.log(`Job ${job.id} failed with ${err.message}`);
    });

    worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed with result ${job.returnvalue}`);
    });
  }

  async disconnect() {
    await this.queue.close();
    await this.worker.close();
  }
}
