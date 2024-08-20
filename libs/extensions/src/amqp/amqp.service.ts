// src/rabbitmq/rabbitmq.service.ts
import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import amqp, { Channel, ChannelWrapper } from 'amqp-connection-manager';
import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/types/AmqpConnectionManager';
import { AmpqConfig } from './amqp.module';

@Injectable()
export class AmqpService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AmqpService.name);
  private connection: IAmqpConnectionManager;
  private channel: ChannelWrapper;
  public queues: { [key: string]: any } = {};

  constructor(@Inject('AMQP_CONFIG') private readonly config: AmpqConfig) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.channel.close();
    await this.connection.close();
  }

  private async connect() {
    this.connection = await amqp.connect({
      protocol: 'amqp',
      hostname: this.config.host,
      port: this.config.port,
      username: this.config.username,
      password: this.config.password,
      vhost: this.config.vhost,
    });

    this.channel = await this.connection.createChannel({
      setup: async (channel: Channel) => {
        for (const queue of this.config.queues) {
          this.queues[queue] = queue;
          await channel.assertQueue(queue, { durable: true });
        }
      },
    });
    this.logger.log('Connected to AmqpServer');
  }

  async addToQueue<T>(queue: string, payload: { name: string; data: T }) {
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });
  }
}
