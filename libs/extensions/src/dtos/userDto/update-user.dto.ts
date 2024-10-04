import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@rumsan/sdk/enums';
import { User } from '@rumsan/sdk/types';
import { listGenders } from '@rumsan/sdk/utils';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto implements User {
  @ApiProperty({
    example: 'Jane',
    description: 'The full name of the User',
    required: true,
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'FEMALE',
    description: 'Gender of the User',
  })
  @IsOptional()
  @IsString()
  @IsIn(listGenders())
  gender: Gender;

  @ApiProperty({
    description: 'Custom details of the User',
  })
  @IsOptional()
  details: Record<string, any>;

  @ApiProperty({
    example: 'jane@rumsan.com',
    description: 'Email of the User',
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: '9841234567',
    description: 'Phone number of the User',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: '0x1234567890abcdef',
    description: 'Wallet address of the User',
  })
  @IsString()
  @IsOptional()
  wallet?: string;
}
