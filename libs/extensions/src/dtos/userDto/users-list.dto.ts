import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../shared/pagination.dto';

export class ListUserDto extends PaginationDto {
  @IsIn(['createdAt'])
  override sort: string = 'createdAt';
  override order: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    example: 'admin',
    description: 'Filter users by role',
  })
  @IsString()
  @IsOptional()
  role?: string;
}
