// queue.service.ts

import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class QueueService implements OnModuleInit {
  constructor(
    @Inject('TRANSPORT')
    private readonly transport: any,
  ) {
    console.log('transport', this.transport);
  }

  onModuleInit() {
    console.log('transport', this.transport);
    this.connect();
  }

  async connect() {
    if (!this.transport) {
      throw new Error('Transport is not defined');
    }
    await this.transport.connect();
  }

  async sendMessage(queue: string, data: any) {
    await this.transport.sendMessage(queue, data);
  }

  async receiveMessage(queue: string, callback: (data: any) => void) {
    return this.transport.receiveMessage(queue, callback);
  }

  async disconnect() {
    await this.transport.disconnect();
  }
}
