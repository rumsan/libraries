import { Injectable } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';
import { QueueService } from '@rumsan/queue';
import { AuthService, UserService } from '@rumsan/user';

@Injectable()
export class AppUserService extends UserService {
  constructor(
    protected prisma: PrismaService,
    public authService: AuthService,
    private queueService: QueueService,
  ) {
    super(prisma, authService);
  }

  // @OnMessage()
  async Test(dto: any) {
    // console.log('queueService', { s: this.queueService });
    this.queueService.sendMessage('APP_QUEUE', {
      message: 'another santosh',
      data: {
        name: 'test',
      },
    });
    // this.queueService.receiveMessage('QUEUE_TEST', (data: Job<any>) => {
    //   console.log('data', data);
    //   console.log(data.getState());
    //   return data;
    // });

    return { message: 'success' };
  }
}
