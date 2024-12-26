import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @IsString()
  @IsOptional()
  walletSignature?: `0x${string}`;
}
