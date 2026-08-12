import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ListUserRolesDto {
  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeExpired?: boolean = false;

  @ApiProperty({ example: 'project-uuid-xyz', required: false })
  @IsOptional()
  @IsString()
  xrefId?: string;
}
