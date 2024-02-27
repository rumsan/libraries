import { IsIn } from 'class-validator';
import { PaginationDto } from '../shared/pagination.dto';

export class ListRoleDto extends PaginationDto {
  @IsIn(['createdAt'])
  override sort: string = 'createdAt';
  override order: 'asc' | 'desc' = 'desc';
}
