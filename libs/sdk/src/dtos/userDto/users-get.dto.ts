import { PaginationDto } from '@rumsan/core';
import { IsIn } from 'class-validator';

export class JptDto extends PaginationDto {
  @IsIn(['createdAt'])
  override sort: string = 'createdAt';
  override order: 'asc' | 'desc' = 'desc';
}
