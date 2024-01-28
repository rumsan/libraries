import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class SignupEmailDto {
  @ApiProperty({
    example: 'jane@rumsan.com',
    description: 'Email of the User',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Jane',
    description: 'The full name of the User',
    required: true,
  })
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'FEMALE',
    description: 'Gender of the User',
  })
  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    example: { address: 'Nepal', age: 20 },
    description: 'extra data of the User',
  })
  @IsObject()
  @IsOptional()
  extras?: object;
}
