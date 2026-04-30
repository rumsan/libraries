import { ApiProperty } from '@nestjs/swagger';
import { Service } from '@rumsan/sdk/enums';
import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SetPasswordDto {
  @ApiProperty({
    example: 'SecurePass123!',
    description:
      'New password (min 8 characters, must include uppercase, lowercase, number, and special character)',
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
    description: 'Service type to set password for (EMAIL, PHONE, or USERNAME)',
    enum: Service,
    required: true,
  })
  @IsEnum(Service)
  @IsNotEmpty()
  service: Service;
}
