import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateRoleAssignmentDto {
  @ApiProperty({ example: '2026-12-31T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  expiry?: string;

  @ApiProperty({ example: 'admin' })
  @IsString()
  name: string;
}
