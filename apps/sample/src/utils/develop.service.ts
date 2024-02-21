import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Service } from '@rumsan/sdk/enums';
import { AuthsService } from '@rumsan/user';

@Injectable()
export class DevService {
  constructor(
    private authService: AuthsService,
    @Inject('RAHAT_CLIENT') private readonly rahatClient: ClientProxy,
  ) {}

  log(cmd: string, data: any) {
    if (process.env.NODE_ENV === 'production') return;
    this.rahatClient.send({ cmd, dev: true }, data).subscribe();
  }

  async otp(data: any) {
    if (process.env.NODE_ENV === 'production') return;
    const auth = await this.authService.loginByOtp(
      {
        challenge: data.challenge,
        service: Service.EMAIL,
        otp: data.otp,
      },
      {
        ip: '::1',
        userAgent: 'na',
      },
    );
    this.rahatClient
      .send(
        { cmd: 'slack', dev: true },
        {
          otp: data.otp,
          accessToken: auth.accessToken,
        },
      )
      .subscribe();
  }
}
