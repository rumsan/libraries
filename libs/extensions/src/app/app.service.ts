import { Injectable } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts';
import { CreateApplicationDto } from './dtos/create-app.dto';

@Injectable()
export class RumsanAppService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateApplicationDto) {
    let privateKey = null;
    if (!dto.publicKey) {
      privateKey = generatePrivateKey();
      dto.publicKey = privateKeyToAddress(privateKey);
    }

    const app = await this.prisma.application.create({
      data: dto,
    });

    return {
      app,
      privateKey,
      message: 'This private key is shown only once. Please save it safely.',
    };
  }

  async findAll() {
    const apps = await this.prisma.application.findMany();
    return apps;
  }
}
