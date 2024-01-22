// queue.service.ts

import { Inject, Injectable } from '@nestjs/common';
import { IQueueModuleOptions } from './interface/queue-config.interfaces';
import { TransportInterface } from './interface/transport.interface';

@Injectable()
export class QueueService {
  private transport: TransportInterface;

  constructor(
    @Inject('TRANSPORT')
    private readonly transportV: IQueueModuleOptions['transport'],
  ) {
    this.transport = this.transportV as TransportInterface;
    this.initializeTransport();
  }

  setTransport(transport: TransportInterface) {
    this.transport = transport;
  }

  async connect() {
    if (!this.transport) {
      this.initializeTransport();
    }
    await this.transport.connect();
  }

  async sendMessage(queue: string, data: any) {
    if (!this.transport) {
      this.initializeTransport();
    }
    await this.transport.sendMessage(queue, data);
  }

  async receiveMessage(queue: string, callback: (data: any) => void) {
    if (!this.transport) {
      this.initializeTransport();
    }
    return this.transport.receiveMessage(queue, callback);
  }

  async disconnect() {
    if (!this.transport) {
      this.initializeTransport();
    }
    await this.transport.disconnect();
  }

  private async initializeTransport() {
    await this.transport.connect();
  }
}
