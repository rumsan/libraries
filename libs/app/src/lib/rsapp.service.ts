import { Injectable } from '@nestjs/common';
import { ApplicationEnvironment } from '@prisma/client';
import { PrismaService } from '@rumsan/prisma';
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts';
import { CreateApplicationDto } from './dtos/create-app.dto';

@Injectable()
export class RumsanAppService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateApplicationDto): Promise<{
    app: {
      cuid: string;
      name: string;
      publicKey: string | null;
      description: string | null;
      environment: ApplicationEnvironment;
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
    };
    privateKey: `0x${string}` | null;
    message: string;
  }> {
    let privateKey = null;

    // Generate privateKey and publicKey if publicKey is not provided
    if (!dto.publicKey) {
      privateKey = generatePrivateKey();
      dto.publicKey = privateKeyToAddress(privateKey);
    }

    const app = await this.prisma.application.create({
      data: dto,
    });

    // Return application details and privateKey
    return {
      app,
      privateKey,
      message: 'This private key is shown only once. Please save it safely.',
    };
  }

  async findAll(): Promise<
    {
      cuid: string;
      name: string;
      publicKey: string | null;
      description: string | null;
      environment: ApplicationEnvironment;
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
    }[]
  > {
    return await this.prisma.application.findMany();
  }
}
