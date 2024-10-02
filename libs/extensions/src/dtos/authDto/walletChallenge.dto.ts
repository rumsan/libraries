import { ApiProperty } from '@nestjs/swagger';
import { isCuid } from '@paralleldrive/cuid2';
import { IsOptional, ValidateIf } from 'class-validator';

export class WalletChallengeDto {
  @ApiProperty({
    example: '105cd449-53f6-44e4-85f3-feaa7d762ffa',
  })
  @ValidateIf((o) => isCuid(o.clientId))
  @IsOptional()
  clientId: string;
}
