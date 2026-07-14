import { ApiProperty } from '@nestjs/swagger';
import { Service } from '@rumsan/sdk/enums';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class PasswordLoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Username, email address, or phone number',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Identifier must be at least 2 characters long' })
  identifier: string; // Can be username, email, or phone

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'User password',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'EMAIL',
    description:
      'Service type (EMAIL, PHONE, or USERNAME). If not provided, will be auto-detected from identifier',
    enum: Service,
    required: false,
  })
  @IsEnum(Service)
  @IsOptional()
  service?: Service;
}
