import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'Create',
  })
  @IsNotEmpty()
  action: string;

  @ApiProperty({
    example: 'user',
  })
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    example: 2,
  })
  @IsNotEmpty()
  roleId: number;
}
