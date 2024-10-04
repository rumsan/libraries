import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@rumsan/sdk/enums';
import { listGenders } from '@rumsan/sdk/utils';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Jane',
    description: 'The full name of the User',
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Custom details of the User',
  })
  @IsOptional()
  details: Record<string, any>;

  @ApiProperty({
    example: 'FEMALE',
    description: 'Gender of the User',
  })
  @IsOptional()
  @IsIn(listGenders())
  gender: Gender;

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

  @ApiProperty({
    example: ['admin', 'user'],
    description: 'Roles of the User',
  })
  @IsString({ each: true })
  @IsOptional()
  roles: string[];
}
