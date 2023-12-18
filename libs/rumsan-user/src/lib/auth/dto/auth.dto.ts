import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SignupDto {
	@ApiProperty({
		example: 'binod@mailinator.com',
	})
	@IsString()
	@IsNotEmpty()
	authAddress: string;

	@ApiProperty({
		example: 'Email/Phone/Wallet',
	})
	@IsString()
	authType: string;

	@ApiProperty({
		example: 3,
	})
	@IsOptional()
	@IsNumber()
	roleId: number;

	@ApiProperty({
		example: 'Binod',
	})
	@IsNotEmpty()
	firstName: string;

	@ApiProperty({
		example: 'Chaudhary',
	})
	@IsNotEmpty()
	lastName: string;
}

export class OtpDto {
	@ApiProperty({
		example: 'binod@mailinator.com',
	})
	@IsString()
	@IsNotEmpty()
	authAddress: string;
}

export class LoginDto {
	@ApiProperty({
		example: 'binod@mailinator.com',
	})
	@IsString()
	@IsNotEmpty()
	authAddress: string;

	@ApiProperty({
		example: '123456',
	})
	@IsString()
	@IsNotEmpty()
	otp: string;
}

export class WalletLoginDto {
	@IsString()
	@IsNotEmpty()
	signature: string;

	@IsString()
	@IsNotEmpty()
	message: string;
}
