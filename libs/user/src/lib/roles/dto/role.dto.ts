import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationDto, StringUtils } from '@rumsan/core';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { PermissionSet } from '../../interfaces';

export class CreateRoleDto {
  @ApiProperty({
    example: 'Manager',
  })
  @ValidateIf((o, v) => StringUtils.isValidString(v))
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: false,
  })
  @IsOptional()
  isSystem?: boolean;

  @ApiProperty({
    example: JSON.stringify({
      user: ['manage', 'read'],
    }),
  })
  @IsOptional()
  permissions: PermissionSet;
}

export class EditRoleDto extends PartialType(CreateRoleDto) {
  override name: string;
}

export class RoleListDto extends PaginationDto {
  @IsIn(['createdAt'])
  override sort: string = 'createdAt';
  override order: 'asc' | 'desc' = 'desc';
}

export class CreatePermissionDto {
  @ApiProperty({
    example: 'Create',
  })
  @IsNotEmpty()
  action: string;

  @ApiProperty({
    example: 'user',
  })
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    example: 2,
  })
  @IsNotEmpty()
  roleId: number;
}

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

export class PermissionSearchDto {
  @IsString()
  action: string;

  @IsString()
  subject: string;
}
