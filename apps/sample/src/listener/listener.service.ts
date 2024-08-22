import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '@rumsan/extensions/constants';
import { DevService } from '../utils/develop.service';
import { EmailService } from '../utils/email.service';

@Injectable()
export class ListenerService {
  private otp: string;
  private readonly logger = new Logger(ListenerService.name);
  constructor(
    private emailService: EmailService,
    private readonly devService: DevService,
  ) {}

  @OnEvent(EVENTS.OTP_CREATED)
  async sendOTPEmail(data: any) {
    this.otp = data.otp;
    // this.emailService.sendEmail(
    //   data.address,
    //   'OTP for login',
    //   'OTP for login',
    //   `<h1>OTP for login</h1><p>${data.otp}</p>`,
    // );
  }

  @OnEvent(EVENTS.CHALLENGE_CREATED)
  async sendChallengeToDev(data: any) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.devService.otp({
      otp: this.otp,
      challenge: data.challenge.challenge,
      requestInfo: data.requestInfo,
    });
  }
}
