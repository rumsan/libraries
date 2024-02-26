import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { SignupEmailDto } from './signup-email.dto';

export class SignupPhoneDto extends OmitType(SignupEmailDto, [
  'email',
] as const) {
  @ApiProperty({
    example: '9841234567',
    description: 'Phone number of the User',
  })
  @IsString()
  phone: string;
}
