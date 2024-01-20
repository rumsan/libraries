import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Jane',
    description: 'The full name of the User',
    required: true,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'FEMALE',
    description: 'Gender of the User',
  })
  @IsOptional()
  @IsString()
  gender?: Gender;
}
