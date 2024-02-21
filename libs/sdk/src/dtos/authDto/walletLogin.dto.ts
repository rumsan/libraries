import { IsNotEmpty, IsString } from 'class-validator';
export class WalletLoginDto {
  @IsString()
  @IsNotEmpty()
  signature: string;

  @IsString()
  @IsNotEmpty()
  challenge: string;
}
