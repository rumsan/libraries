import { IntersectionType, OmitType } from '@nestjs/swagger';
import { WalletDto } from '@rumsan/core';
import { SignupEmailDto } from './signup-email.dto';

export class SignupWalletDto extends IntersectionType(
  OmitType(SignupEmailDto, ['email'] as const),
  WalletDto,
) {}
