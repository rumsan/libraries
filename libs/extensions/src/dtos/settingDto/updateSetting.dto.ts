import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateSettngsDto {
  @ApiProperty({
    type: 'object',
    example: {
      field1: 'value1',
      field2: 'value2',
    },
  })
  @IsOptional()
  @IsNotEmpty()
  value!: object;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
    },
    required: false,
    example: ['field1', 'field2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredFields?: string[];

  @ApiProperty({
    type: 'boolean',
    example: false,
  })
  @IsBoolean()
  isPrivate!: false;

  @ApiProperty({
    type: 'boolean',
    example: false,
  })
  @IsBoolean()
  isReadOnly!: false;

  @IsOptional()
  @IsNotEmpty()
  sessionId?: string;

  @IsOptional()
  @IsNotEmpty()
  updatedBy?: string;
}
