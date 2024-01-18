import { Inject, Injectable } from '@nestjs/common';
import { IStorage } from './interfaces/storage.interface';

@Injectable()
export class DocmanService {
  private selectedStorage: IStorage;

  constructor(@Inject('STORAGE') private readonly storageConfig: any) {
    this.selectedStorage = this.storageConfig.transport;
    this.selectedStorage.initialize(this.storageConfig.config);
  }

  async upload(file: Buffer, filename: string): Promise<string> {
    return this.selectedStorage.upload(file, filename);
  }

  async download(fileKey: string): Promise<Buffer> {
    return this.selectedStorage.download(fileKey);
  }

  async delete(fileKey: string): Promise<void> {
    return this.selectedStorage.delete(fileKey);
  }
}
