import { ApiProperty } from '@nestjs/swagger';
import { ApplicationEnvironment } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({
    example: 'Rahat',
    description: 'Name of the application',
  })
  @IsString()
  public name: string;

  @ApiProperty({
    example: 'Rahat is a decentralized application',
    description: 'Description of the application',
  })
  @IsString()
  @IsOptional()
  public description: string;

  @ApiProperty({
    example: ApplicationEnvironment.DEVELOPMENT,
    enum: ApplicationEnvironment,
  })
  @IsString()
  public environment: ApplicationEnvironment;

  @ApiProperty({
    example: '0x1234567890123456789012345678901234567890',
    description: 'Ethereum address format compressed public key',
  })
  @IsOptional()
  public publicKey: string;
}
