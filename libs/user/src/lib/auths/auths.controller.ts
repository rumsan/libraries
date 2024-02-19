import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestDetails, TRequestDetails } from '@rumsan/core';
import { AuthsService } from './auths.service';
import { ChallengeDto, OtpDto, OtpLoginDto, WalletLoginDto } from './dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthsController {
  constructor(private authService: AuthsService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  loginOtp(
    @Body() dto: OtpLoginDto,
    @RequestDetails() rdetails: TRequestDetails,
  ) {
    return this.authService.loginByOtp(dto, rdetails);
  }

  @HttpCode(HttpStatus.OK)
  @Post('otp')
  getOtp(@Body() dto: OtpDto, @RequestDetails() rdetails: TRequestDetails) {
    return this.authService.getOtp(dto, rdetails);
  }

  @Post('wallet')
  walletLogin(
    @Body() dto: WalletLoginDto,
    @RequestDetails() rdetails: TRequestDetails,
  ) {
    return this.authService.loginByWallet(dto, rdetails);
  }

  @Post('challenge')
  getChallenge(
    @Body() dto: ChallengeDto,
    @RequestDetails() rdetails: TRequestDetails,
  ) {
    return this.authService.getChallengeForWallet(dto, rdetails);
  }
}
