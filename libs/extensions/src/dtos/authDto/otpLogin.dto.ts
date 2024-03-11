import { ApiProperty } from '@nestjs/swagger';
import { Service } from '@rumsan/sdk/enums';
import { IsNotEmpty, IsString } from 'class-validator';
export class OtpLoginDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  challenge: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({
    example: 'EMAIL',
  })
  service: Service | null;
}
