import { ApiProperty } from '@nestjs/swagger';
import {
	IsBoolean,
	IsNotEmpty,
	IsNotEmptyObject,
	IsOptional,
	IsString,
} from 'class-validator';

export class EditSettingsDto {
	@ApiProperty({
		example: 'Email Config',
	})
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		type: 'object',
		example: {
			key1: 'value1',
			key2: 'value2',
		},
	})
	@IsNotEmptyObject()
	value: Record<string, any>;

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
