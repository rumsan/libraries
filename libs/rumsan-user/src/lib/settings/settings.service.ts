import { PrismaService } from '@binod7/prisma-db';
import { ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
// import { CreateSettingsDto } from './dto/create-settings.dto';

@Injectable()
export class SettingsService {
	constructor(private prisma: PrismaService) {}

	create(dto: any) {
		try {
			return this.prisma.settings.create({ data: dto });
		} catch (err) {
			if (err instanceof PrismaClientKnownRequestError) {
				console.log('ERRO==>', err);
				if (err.code === 'P2002') {
					throw new ForbiddenException('Settings already exist!');
				}
				throw err;
			}
		}
	}

	async update(id: number, dto: any) {
		try {
			try {
				const row = await this.getById(id);
				if (!row) throw new HttpException('Settings does not exist!', 404);
				return this.prisma.settings.update({
					where: {
						id: +id,
					},
					data: { ...dto },
				});
			} catch (err) {
				throw err;
			}
		} catch (err) {
			throw err;
		}
	}

	getById(id: number) {
		try {
			return this.prisma.settings.findUnique({ where: { id: +id } });
		} catch (err) {
			throw err;
		}
	}

	getByName(name: string) {
		try {
			return this.prisma.settings.findUnique({ where: { name } });
		} catch (err) {
			throw err;
		}
	}

	listPublicOnly() {
		try {
			return this.prisma.settings.findMany({ where: { isPrivate: false } });
		} catch (err) {
			throw err;
		}
	}

	async delete(id: number) {
		try {
			const row = await this.getById(id);
			if (!row) throw new HttpException('Settings does not exist!', 404);
			return this.prisma.settings.delete({ where: { id: +id } });
		} catch (err) {
			throw err;
		}
	}
}
