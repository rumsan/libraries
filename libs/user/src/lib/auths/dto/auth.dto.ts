import { ApiProperty } from '@nestjs/swagger';
import { Service } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class OtpDto {
  @ApiProperty({
    example: 'rumsan@mailinator.com',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    example: 'EMAIL',
  })
  service: Service | null;

  @ApiProperty({
    example: '',
  })
  @IsUUID()
  @IsOptional()
  clientId: string;
}

export class OtpLoginDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  challenge: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({
    example: 'EMAIL',
  })
  service: Service | null;
}

export class ChallengeDto {
  @ApiProperty({
    example: '',
  })
  @IsUUID()
  @IsOptional()
  clientId: string;
}

export class WalletLoginDto {
  @IsString()
  @IsNotEmpty()
  signature: string;

  @IsString()
  @IsNotEmpty()
  challenge: string;
}
