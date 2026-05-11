import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { AddPermissionDto } from './addPermission.dto';

export class BulkAddPermissionsDto {
  @ApiProperty({ type: [AddPermissionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddPermissionDto)
  permissions: AddPermissionDto[];
}
