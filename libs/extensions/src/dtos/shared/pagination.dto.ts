import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    example: 1,
    description: 'page number',
    required: false,
  })
  @IsInt()
  page = 1;

  @ApiProperty({
    example: 10,
    description: 'number of items per page',
    required: false,
  })
  @IsInt()
  perPage = 20;

  @ApiProperty({
    example: 'createdAt',
    description: 'Sort field',
    required: false,
  })
  @IsOptional()
  @IsString()
  sort: string;

  @ApiProperty({
    example: 'desc',
    description: 'Sort order',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'asc';
}
