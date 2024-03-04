import { ApiProperty } from '@nestjs/swagger';
import { Service } from '@rumsan/sdk/enums';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class OtpDto {
  @ApiProperty({
    example: 'rumsan@mailinator.com',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    example: 'EMAIL',
  })
  service?: Service | null;

  @ApiProperty({
    example: '105cd449-53f6-44e4-85f3-feaa7d762ffa',
  })
  @IsUUID()
  @IsOptional()
  clientId?: string;
}
