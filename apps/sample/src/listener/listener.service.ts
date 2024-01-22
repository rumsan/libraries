import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CONSTANTS_RSUSER } from '@rumsan/user';

@Injectable()
export class ListenerService {
  @OnEvent(CONSTANTS_RSUSER.EVENTS.OTP_CREATED)
  sendOTPEmail(data: any) {
    console.log('Use your messenger service!', data);
  }

  @OnEvent(CONSTANTS_RSUSER.EVENTS.EMAIL_TO_VERIFY)
  sendEmailVerification(data: any) {
    console.log('Use your messenger service!', data);
  }
}
