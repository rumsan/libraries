import { PrismaService } from '@binod7/prisma-db';
import {
	ForbiddenException,
	HttpException,
	HttpStatus,
	Injectable,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateSettingsDto, EditSettingsDto } from './dto';

@Injectable()
export class SettingsService {
	constructor(private prisma: PrismaService) {}

	stringToArray(value: string) {
		let arr: string[] = [];
		if (typeof value == 'string') arr = value.split(',');
		return arr.map((v) => v.trim());
	}

	isJsonObject(str: any, isAlreadyString = false) {
		try {
			if (Array.isArray(str)) return false;
			let json = isAlreadyString
				? JSON.parse(str)
				: JSON.parse(JSON.stringify(str));
			return typeof json === 'object';
		} catch (e) {
			return false;
		}
	}

	convertObjectKeysToUpperCase(source: any): Record<string, any> {
		return Object.keys(source).reduce(
			(destination: Record<string, any>, key: string) => {
				destination[key.toUpperCase()] = source[key];
				return destination;
			},
			{},
		);
	}

	hasAllFields = (requiredFields: string, suppliedFields: string): boolean => {
		const reqFields = this.stringToArray(requiredFields);
		const suppFields = this.stringToArray(suppliedFields);

		return reqFields.every((element: string) => {
			return suppFields.indexOf(element) !== -1;
		});
	};

	create(dto: CreateSettingsDto) {
		try {
			dto.name = dto.name.toUpperCase();
			// Check and convert reqFields to Array
			const reqFields = dto.requiredFields
				? this.stringToArray(dto.requiredFields)
				: null;
			if (reqFields?.length) {
				// Check if dto.value is JSON
				if (!this.isJsonObject(dto.value))
					throw new HttpException(
						'Must send JSON object when requiredField is specified.',
						HttpStatus.BAD_REQUEST,
					);
				// Convert fields to Uppercase
				dto.requiredFields = reqFields.map((f) => {
					return f.toUpperCase();
				});
				// Update dto.value keys to Uppercase
				dto.value = this.convertObjectKeysToUpperCase(dto.value);
				// Check requiredFields exist in suppliedFields
				const suppliedFields = Object.keys(dto.value).toString();
				const hasAll = this.hasAllFields(
					dto.requiredFields.toString(),
					suppliedFields,
				);
				if (!hasAll)
					throw new HttpException(
						`Must send all required fields [${dto.requiredFields.join(',')}]`,
						HttpStatus.BAD_REQUEST,
					);
			}
			dto.value = { data: dto.value };
			return this.prisma.settings.create({ data: dto });
		} catch (err) {
			console.log('ERRO==>', err);
			if (err instanceof PrismaClientKnownRequestError) {
				if (err.code === 'P2002') {
					throw new ForbiddenException('Settings already exist!');
				}
				throw err;
			}
		}
	}

	async updateByName(dto: EditSettingsDto) {
		try {
			if (!dto.name)
				throw new HttpException(
					'Setting name is required!',
					HttpStatus.NOT_FOUND,
				);
			dto.name = dto.name.toUpperCase();
			// Fetch existing setting
			const setting = await this.prisma.settings.findUnique({
				where: { name: dto.name },
			});
			if (!setting)
				throw new HttpException('Settings not found!', HttpStatus.NOT_FOUND);
			if (setting.isReadOnly)
				throw new HttpException('Setting is read-only', HttpStatus.FORBIDDEN);
			// Check if requiredFields exist
			if (setting?.requiredFields.length) {
				dto.value = this.convertObjectKeysToUpperCase(dto.value);
				const suppliedFields = Object.keys(dto.value).toString();
				// Check if supplied fields exist inside requiredFields
				const hasAll = this.hasAllFields(
					setting.requiredFields.toString(),
					suppliedFields,
				);
				if (!hasAll)
					throw new HttpException(
						`Must send all required fields [${setting.requiredFields.join(
							',',
						)}]`,
						HttpStatus.BAD_REQUEST,
					);
				dto.requiredFields = suppliedFields.split(',');
				// Filter only requiredFields matching supplied fields
				const json_value: Record<string, any> = Object.keys(dto.value)
					.filter((key: string) => setting.requiredFields.includes(key))
					.reduce((obj: Record<string, any>, key: string) => {
						obj[key] = (dto.value as Record<string, any>)[key];
						return obj;
					}, {});

				dto.value = { data: json_value };
			} else {
				dto.requiredFields = [];
			}
			return this.prisma.settings.update({
				where: {
					id: +setting.id,
				},
				data: { ...dto },
			});
		} catch (err) {
			throw err;
		}
	}

	getById(id: number) {
		try {
			return this.prisma.settings.findUnique({
				where: { id: +id },
			});
		} catch (err) {
			throw err;
		}
	}

	getPublic(id: number) {
		try {
			return this.prisma.settings.findUnique({
				where: { id: +id, isPrivate: false },
			});
		} catch (err) {
			throw err;
		}
	}

	getByName(name: string) {
		try {
			return this.prisma.settings.findUnique({
				where: { name, isPrivate: false },
			});
		} catch (err) {
			throw err;
		}
	}

	listPublic() {
		try {
			return this.prisma.settings.findMany({ where: { isPrivate: false } });
		} catch (err) {
			throw err;
		}
	}

	async delete(id: number) {
		try {
			const row = await this.getById(id);
			if (!row)
				throw new HttpException(
					'Settings does not exist!',
					HttpStatus.NOT_FOUND,
				);
			return this.prisma.settings.delete({ where: { id: +id } });
		} catch (err) {
			throw err;
		}
	}
}
