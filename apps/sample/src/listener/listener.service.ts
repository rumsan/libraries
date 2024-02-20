import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Enums } from '@rumsan/sdk';
import { AuthsService, EVENTS } from '@rumsan/user';
import { EmailService } from './email.service';
import { SlackService } from './slack.service';

@Injectable()
export class ListenerService {
  private otp: string;
  private readonly logger = new Logger(ListenerService.name);
  constructor(
    private authService: AuthsService,
    private emailService: EmailService,
    private slackService: SlackService,
  ) {}
  @OnEvent(EVENTS.OTP_CREATED)
  async sendOTPEmail(data: any) {
    console.log('OTP: ' + data.otp);
    this.otp = data.otp;
    // this.emailService.sendEmail(
    //   data.address,
    //   'OTP for login',
    //   'OTP for login',
    //   `<h1>OTP for login</h1><p>${data.otp}</p>`,
    // );
    this.logger.log('OTP sent to ' + data.address);
    this.slackService.send(`OTP for login: ${data.otp}`);
  }

  //TODO PLEASE REMOVE THIS
  @OnEvent(EVENTS.CHALLENGE_CREATED)
  async TEMP_createJwt(data: any) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const auth = await this.authService.loginByOtp(
      {
        challenge: data.challenge.challenge,
        service: Enums.Service.EMAIL,
        otp: this.otp,
      },
      {
        ip: '::1',
        userAgent: 'na',
      },
    );
    this.slackService.send(auth.accessToken);
  }
}
