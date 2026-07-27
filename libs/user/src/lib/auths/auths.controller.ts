import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RequestDetails } from '@rumsan/extensions/decorators';
import {
  ChallengeDto,
  ChangePasswordDto,
  CreateServiceClientDto,
  OtpDto,
  OtpLoginDto,
  PasswordLoginDto,
  ResetPasswordDto,
  ServiceAuthDto,
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
  getChallenge(
    @Body() dto: ChallengeDto,
    @RequestDetails() rdetails: RequestType,
  ) {
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
    return this.authService.updatePassword(user.id, dto);
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
  @ApiQuery({
    name: 'service',
    enum: Service,
    required: true,
    description:
      'Service type to check password status for (EMAIL, PHONE, USERNAME)',
    example: 'EMAIL',
  })
  checkPasswordStatus(
    @CurrentUser() user: CurrentUserInterface,
    @Query('service') service: Service,
  ) {
    return this.authService.hasPassword(user.id, service);
  }

  // ================== Service Authentication (OAuth2 Client Credentials) ==================

  @HttpCode(HttpStatus.OK)
  @Post('service/token')
  @ApiOperation({
    summary: 'Service Authentication',
    description:
      'OAuth2 Client Credentials Flow - Exchange client_id/client_secret for a Service JWT',
  })
  authenticateService(@Body() dto: ServiceAuthDto) {
    return this.authService.authenticateService(dto);
  }

  @UseGuards(JwtGuard)
  @Post('service/clients')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Service Client',
    description:
      'Create a new service client. Returns clientId and secret (shown only once)',
  })
  createServiceClient(
    @CurrentUser() user: CurrentUserInterface,
    @Body() dto: CreateServiceClientDto,
  ) {
    return this.authService.createServiceClient(dto, user.id);
  }

  @UseGuards(JwtGuard)
  @Get('service/clients')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all service clients' })
  listServiceClients() {
    return this.authService.listServiceClients();
  }

  @UseGuards(JwtGuard)
  @Post('service/clients/:clientId/regenerate')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Regenerate Service Client Secret',
    description:
      'Generate a new secret for a service client. Old secret will be invalidated',
  })
  regenerateServiceClientSecret(@Param('clientId') clientId: string) {
    return this.authService.regenerateServiceClientSecret(clientId);
  }

  @UseGuards(JwtGuard)
  @Patch('service/clients/:clientId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Service Client Permissions' })
  updateServiceClientPermissions(
    @Param('clientId') clientId: string,
    @Body()
    permissions: {
      canImpersonate?: boolean;
      allowedRoles?: string[];
      rateLimit?: number;
      isActive?: boolean;
    },
  ) {
    return this.authService.updateServiceClientPermissions(
      clientId,
      permissions,
    );
  }

  @UseGuards(JwtGuard)
  @Delete('service/clients/:clientId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Service Client' })
  deleteServiceClient(@Param('clientId') clientId: string) {
    return this.authService.deleteServiceClient(clientId);
  }
}
