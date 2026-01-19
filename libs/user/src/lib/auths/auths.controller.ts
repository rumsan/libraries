import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestDetails } from '@rumsan/extensions/decorators';
import {
  ChallengeDto,
  ChangePasswordDto,
  OtpDto,
  OtpLoginDto,
  PasswordLoginDto,
  ResetPasswordDto,
  SetPasswordDto,
  WalletLoginDto,
} from '@rumsan/extensions/dtos';
import { Service } from '@rumsan/sdk/enums';
import { Request as RequestType } from '@rumsan/sdk/types';
import { AuthsService } from './auths.service';
import { CurrentUser } from './decorator/current-user.decorator';
import { JwtGuard } from './guard/jwt.guard';
import { LocalAuthGuard } from './guard/local.guard';
import { CurrentUserInterface } from './interfaces/current-user.interface';

@Controller('auth')
@ApiTags('Auth')
export class AuthsController {
  constructor(private authService: AuthsService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  loginOtp(@Body() dto: OtpLoginDto, @RequestDetails() rdetails: RequestType) {
    return this.authService.loginByOtp(dto, rdetails);
  }

  @HttpCode(HttpStatus.OK)
  @Post('otp')
  getOtp(@Body() dto: OtpDto, @RequestDetails() rdetails: RequestType) {
    return this.authService.getOtp(dto, rdetails);
  }

  @Post('wallet')
  walletLogin(
    @Body() dto: WalletLoginDto,
    @RequestDetails() rdetails: RequestType,
  ) {
    return this.authService.loginByWallet(dto, rdetails);
  }

  @Post('challenge')
  getChallenge(@Body() dto: ChallengeDto, @RequestDetails() rdetails: RequestType) {
    return this.authService.getChallengeForWallet(dto, rdetails);
  }

  // Password authentication endpoints
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login/password')
  async loginPassword(
    @Body() dto: PasswordLoginDto,
    @Request() req: any,
    @RequestDetails() rdetails: RequestType,
  ) {
    // req.user is populated by LocalStrategy after successful validation
    return this.authService.createAuthSessionAndToken(req.user, rdetails);
  }

  @UseGuards(JwtGuard)
  @Post('password/set')
  setPassword(
    @CurrentUser() user: CurrentUserInterface,
    @Body() dto: SetPasswordDto,
  ) {
    return this.authService.setPassword(user.id, dto);
  }

  @UseGuards(JwtGuard)
  @Post('password/change')
  changePassword(
    @CurrentUser() user: CurrentUserInterface,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.updatePassword(
      user.id,
      dto.oldPassword,
      dto.newPassword,
      dto.confirmPassword,
      dto.service,
    );
  }

  @Post('password/reset')
  resetPassword(
    @Body() dto: ResetPasswordDto,
    @RequestDetails() rdetails: RequestType,
  ) {
    return this.authService.resetPasswordWithOtp(dto, rdetails);
  }

  @UseGuards(JwtGuard)
  @Get('password/status')
  checkPasswordStatus(
    @CurrentUser() user: CurrentUserInterface,
    @Query('service') service: Service,
  ) {
    return this.authService.hasPassword(user.id, service);
  }
}
