import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthsService } from './auths.service';
import { ChallengeDto, OtpDto, OtpLoginDto, WalletLoginDto } from './dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthsController {
  constructor(private authService: AuthsService) {}

  _getRequestInfo(request: Request) {
    return {
      ip: request.ip,
      userAgent: request.get('user-agent'),
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  loginOtp(@Req() request: Request, @Body() dto: OtpLoginDto) {
    return this.authService.loginByOtp(dto, this._getRequestInfo(request));
  }

  @HttpCode(HttpStatus.OK)
  @Post('otp')
  getOtp(@Req() request: Request, @Body() dto: OtpDto) {
    return this.authService.getOtp(dto, this._getRequestInfo(request));
  }

  @Post('wallet')
  walletLogin(@Req() request: Request, @Body() dto: WalletLoginDto) {
    return this.authService.loginByWallet(dto, this._getRequestInfo(request));
  }

  @Post('challenge')
  getChallenge(@Req() request: Request, @Body() dto: ChallengeDto) {
    return this.authService.getChallengeForWallet(
      dto,
      this._getRequestInfo(request),
    );
  }
}
