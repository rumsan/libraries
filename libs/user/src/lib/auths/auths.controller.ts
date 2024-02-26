import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestDetails } from '@rumsan/extensions/decorators';
import {
  ChallengeDto,
  OtpDto,
  OtpLoginDto,
  WalletLoginDto,
} from '@rumsan/extensions/dtos';
import { Request } from '@rumsan/sdk/types';
import { AuthsService } from './auths.service';

@Controller('auth')
@ApiTags('Auth')
export class AuthsController {
  constructor(private authService: AuthsService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  loginOtp(@Body() dto: OtpLoginDto, @RequestDetails() rdetails: Request) {
    return this.authService.loginByOtp(dto, rdetails);
  }

  @HttpCode(HttpStatus.OK)
  @Post('otp')
  getOtp(@Body() dto: OtpDto, @RequestDetails() rdetails: Request) {
    return this.authService.getOtp(dto, rdetails);
  }

  @Post('wallet')
  walletLogin(
    @Body() dto: WalletLoginDto,
    @RequestDetails() rdetails: Request,
  ) {
    return this.authService.loginByWallet(dto, rdetails);
  }

  @Post('challenge')
  getChallenge(@Body() dto: ChallengeDto, @RequestDetails() rdetails: Request) {
    return this.authService.getChallengeForWallet(dto, rdetails);
  }
}
