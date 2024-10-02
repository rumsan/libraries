import { ApiProperty } from '@nestjs/swagger';
import { isCuid } from '@paralleldrive/cuid2';
import { IsString, ValidateIf } from 'class-validator';

export class SignupApproveDto {
  @ApiProperty({
    example: 'c94f2215-4522-4889-99c3-6a360f4a47bb',
    description: 'Signup Cuid',
    required: true,
  })
  @IsString()
  @ValidateIf((o) => isCuid(o.cuid))
  cuid: string;
}
