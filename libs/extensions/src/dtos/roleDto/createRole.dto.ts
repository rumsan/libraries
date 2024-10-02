import { ApiProperty } from '@nestjs/swagger';
import { PermissionSet } from '@rumsan/sdk/types';
import { StringUtils } from '@rumsan/sdk/utils';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';
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
