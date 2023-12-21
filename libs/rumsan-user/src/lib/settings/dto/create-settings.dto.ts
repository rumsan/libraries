import { ApiProperty } from '@nestjs/swagger';
import {
	IsBoolean,
	IsDefined,
	IsNotEmpty,
	IsObject,
	IsOptional,
	IsString,
} from 'class-validator';

export class CreateSettingsDto {
	@ApiProperty({
		example: 'Email Config',
	})
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		example: {
			key1: 'value1',
			key2: 'value2',
		},
	})
	value: any;

	@ApiProperty({
		example: false,
	})
	@IsOptional()
	@IsBoolean()
	isReadOnly: boolean;

	@ApiProperty({
		example: true,
	})
	@IsOptional()
	@IsBoolean()
	isPrivate: boolean;
}
