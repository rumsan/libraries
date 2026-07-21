import { ApiProperty } from '@nestjs/swagger';
import { IsFlexiblePhone, IsUsername } from '@rumsan/extensions/decorators';
import { Service } from '@rumsan/sdk/enums';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class SignupPasswordDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'john_doe',
    description: 'Unique username (optional)',
    required: false,
  })
  @IsUsername()
  @IsOptional()
  username?: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: '+9779841234567',
    description: 'Phone number (10-15 digits, optional + prefix)',
    required: false,
  })
  @IsFlexiblePhone()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description:
      'Password (min 8 characters, must include uppercase, lowercase, number, and special character)',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Password confirmation (must match password)',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty({
    example: 'EMAIL',
    description: 'Service type for password (EMAIL, PHONE, or USERNAME)',
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
