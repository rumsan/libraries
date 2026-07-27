import { ApiProperty } from '@nestjs/swagger';
import { Service } from '@rumsan/sdk/enums';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email, phone, or username',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({
    example: '123456',
    description: 'OTP code received',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({
    example: 'NewPass123!',
    description:
      'New password (min 8 characters, must include uppercase, lowercase, number, and special character)',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({
    example: 'NewPass123!',
    description: 'Password confirmation (must match newPassword)',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty({
    example: 'EMAIL',
    description: 'Service type (EMAIL, PHONE, or USERNAME)',
    enum: Service,
    required: true,
  })
  @IsEnum(Service)
  @IsNotEmpty()
  service: Service;

  @ApiProperty({
    example: false,
    description:
      'If true, skips password strength validation (min length, uppercase, lowercase, digit, special character checks). Password confirmation matching is still enforced. Defaults to false.',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  bypassPasswordValidation?: boolean;
}
