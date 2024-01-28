import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuthsService, EVENTS } from '@rumsan/user';

@Injectable()
export class ListenerService {
  private otp: string;
  constructor(private authService: AuthsService) {}
  @OnEvent(EVENTS.OTP_CREATED)
  async sendOTPEmail(data: any) {
    console.log('OTP: ' + data.otp);
    this.otp = data.otp;
  }

  //TODO PLEASE REMOVE THIS
  @OnEvent(EVENTS.CHALLENGE_CREATED)
  async TEMP_createJwt(data: any) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const auth = await this.authService.loginByOtp(
      {
        challenge: data.challenge.challenge,
        service: 'EMAIL',
        otp: this.otp,
      },
      {
        ip: '::1',
        userAgent: 'na',
      },
    );
    console.log(auth);
  }
}
