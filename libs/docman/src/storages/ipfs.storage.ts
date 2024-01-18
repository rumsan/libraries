// storages/ipfs.storage.ts

import { Injectable } from '@nestjs/common';
import { create } from 'ipfs-http-client';
import { IStorage } from '../interfaces/storage.interface';

@Injectable()
export class IpfsStorage implements IStorage {
  private ipfs: any;

  initialize(config: {
    host: string;
    port: number;
    protocol: 'http' | 'https';
  }): void {
    this.ipfs = create({
      host: config.host,
      port: config.port,
      protocol: config.protocol,
    });
  }

  async upload(file: Buffer, filename: string): Promise<string> {
    const { cid } = await this.ipfs.add('sss');
    return cid.toString();
  }

  async download(fileKey: string): Promise<Buffer> {
    const chunks = [];
    for await (const chunk of this.ipfs.cat(fileKey)) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  async delete(fileKey: string): Promise<void> {
    await this.ipfs.pin.rm(fileKey);
  }
}
