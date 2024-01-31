import { Injectable } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  async getData() {
    const d = await this.prisma.user.findMany();
    // this.queue.sendMessage('APP_QUEUE', { message: 'Hello Santosh', data: d });
    return { message: 'Hello API', data: d };
  }
}
