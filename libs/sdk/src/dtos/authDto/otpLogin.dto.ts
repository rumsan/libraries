import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Service } from '../../enums';
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
