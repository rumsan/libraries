import { Injectable } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import { TransportInterface } from '../../interface/transport.interface';

@Injectable()
export class BullMqService implements TransportInterface {
  private name: string;
  private queues: Record<string, Queue> = {};
  private workers: Record<string, Worker> = {};

  constructor(private readonly config: any) {
    console.log('config', config);
    if (this.config.name) {
      this.name = this.config.name;
    }
  }

  async connect(): Promise<void> {
    // Connect or perform any necessary setup
    const queue = new Queue(this.name, {
      connection: this.config.connection,
    });
    this.queues[this.name] = queue;

    const worker = new Worker(
      this.name,
      async (job) => {
        console.log('job', job);
      },
      {
        connection: {
          host: 'localhost',
          port: 6379,
          password: 'raghav123',
        },
      },
    );
    this.workers[this.name] = worker;
  }

  async sendMessage(name: string, data: any): Promise<void> {
    if (!this.queues[name]) {
      throw new Error(`Queue "${name}" not found.`);
    }

    await this.queues[name].add(name, data);
  }

  async receiveMessage(
    name: string,
    callback: (data: any) => void,
  ): Promise<void> {
    if (!this.queues[name]) {
      throw new Error(`Queue "${name}" not found.`);
    }

    if (!this.workers[name]) {
      this.workers[name] = new Worker(name, async (job) => {
        callback(job.data);
      });
    }
  }

  async disconnect(): Promise<void> {
    // Disconnect or perform any necessary cleanup
    await Promise.all(
      Object.keys(this.queues).map(async (name) => {
        await this.queues[name].close();
      }),
    );
  }
}
