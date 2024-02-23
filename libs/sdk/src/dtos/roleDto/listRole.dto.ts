import { PaginationDto } from '@rumsan/core';
import { IsIn } from 'class-validator';

export class ListRoleDto extends PaginationDto {
  @IsIn(['createdAt'])
  override sort: string = 'createdAt';
  override order: 'asc' | 'desc' = 'desc';
}
