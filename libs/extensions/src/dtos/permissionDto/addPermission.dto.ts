import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class AddPermissionDto {
  @ApiProperty({ example: 'read' })
  @IsNotEmpty()
  @IsString()
  action: string;

  @ApiProperty({ example: 'user' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  inverted?: boolean;

  @ApiProperty({ example: { field: 'value' }, required: false })
  @IsOptional()
  @IsObject()
  conditions?: Prisma.InputJsonValue;

  @ApiProperty({ example: 'Allowed for admins only', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
