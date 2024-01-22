import { Injectable } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';
import { QueueService } from '@rumsan/queue';
import { AuthService, UserService } from '@rumsan/user';

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
    // this.queueService.sendMessage('APP_TEST', dto);
    // this.queueService.sendMessage('USER_@', { message: 'success' });
    this.queueService.receiveMessage('APP_TEST', (data) => {
      console.log('data', data);
    });

    return { message: 'success' };
  }
}
