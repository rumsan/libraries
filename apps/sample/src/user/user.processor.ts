import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UserProcessor {
  private readonly _logger = new Logger('USER_TEST');

  // constructor(@Inject('TRANSPORT') private readonly queue: QueueService) {}

  // public async sendOTP(d): Promise<void> {
  //   this.queue.receiveMessage('USER_TEST', (data) => {
  //     console.log('data', data);
  //   });
  // }
}
