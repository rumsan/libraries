import { PaginationDto } from '@rumsan/core/dtos';
import { IsIn } from 'class-validator';

export class ListUserDto extends PaginationDto {
  @IsIn(['createdAt'])
  override sort: string = 'createdAt';
  override order: 'asc' | 'desc' = 'desc';
}
