import { IsNotEmpty, IsString } from 'class-validator';
export class WalletLoginDto {
  @IsString()
  @IsNotEmpty()
  signature: `0x${string}`;

  @IsString()
  @IsNotEmpty()
  challenge: string;
}
