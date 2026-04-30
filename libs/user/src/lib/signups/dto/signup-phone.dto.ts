import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsFlexiblePhone } from '@rumsan/extensions/decorators';
import { SignupEmailDto } from './signup-email.dto';

export class SignupPhoneDto extends OmitType(SignupEmailDto, [
  'email',
] as const) {
  @ApiProperty({
    example: '+9779841234567',
    description: 'Phone number of the User (10-15 digits, optional + prefix)',
  })
  @IsFlexiblePhone()
  phone: string;
}
