import { Injectable } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';
import { QueueService } from '@rumsan/queue';
import { AuthService, UserService } from '@rumsan/user';
import { Job } from 'bullmq';

@Injectable()
export class AppUserService extends UserService {
  constructor(
    private readonly queueService: QueueService,
    protected prisma: PrismaService,
    public authService: AuthService,
  ) {
    super(prisma, authService);
  }

  async Test(dto: any) {
    // console.log('queueService', { s: this.queueService });
    this.queueService.sendMessage('QUEUE_TEST', {
      message: 'success',
      data: {
        name: 'test',
      },
    });
    this.queueService.receiveMessage('QUEUE_TEST', (data: Job<any>) => {
      console.log('data', data);
      console.log(data.getState());
      return data;
    });

    return { message: 'success' };
  }
}
