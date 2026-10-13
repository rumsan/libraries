import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2026-12-31T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  expiry?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  xrefId?: string;
}

export class BulkAssignRoleDto {
  @ApiProperty({ type: [AssignRoleDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AssignRoleDto)
  roles: AssignRoleDto[];
}
