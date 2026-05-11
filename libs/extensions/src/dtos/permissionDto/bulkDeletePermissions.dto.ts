import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class BulkDeletePermissionsDto {
  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds: number[];
}
