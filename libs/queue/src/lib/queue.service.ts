// queue.service.ts

import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class QueueService {
  constructor(
    @Inject('TRANSPORT')
    private readonly transport: any,
  ) {
    console.log('transport', transport);
    this.initializeTransport();
  }

  // Uncomment the following lines if you want to allow changing the transport
  // setTransport(transport: TransportInterface) {
  //   this.transport = transport;
  // }

  async connect() {
    if (!this.transport) {
      this.initializeTransport();
    }
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

  private async initializeTransport() {}
}
