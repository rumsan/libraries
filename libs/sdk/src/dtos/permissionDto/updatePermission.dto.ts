import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePermissionDto {
  @ApiProperty({
    example: 'Read',
  })
  @IsOptional()
  @IsString()
  action: string;

  @ApiProperty({
    example: 'user',
  })
  @IsOptional()
  @IsString()
  subject: string;

  @ApiProperty({
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  roleId: number;
}
