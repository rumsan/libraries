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
    this.queueService.sendMessage('USER_TEST', {
      message: 'success',
      data: {
        name: 'test',
      },
    });
    this.queueService.receiveMessage('USER_TEST', (data: Job) => {
      console.log('data', data);
      console.log(data.getState());
      return data;
    });

    return { message: 'success' };
  }
}
