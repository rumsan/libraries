import { IsString } from 'class-validator';

export class SearchPermissionDto {
  @IsString()
  action: string;

  @IsString()
  subject: string;
}
