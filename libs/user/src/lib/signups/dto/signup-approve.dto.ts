import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class SignupApproveDto {
  @ApiProperty({
    example: 'c94f2215-4522-4889-99c3-6a360f4a47bb',
    description: 'Signup UUID',
    required: true,
  })
  @IsString()
  @IsUUID('4')
  uuid: string;
}
