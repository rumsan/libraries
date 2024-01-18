// storages/folder.storage.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Storage } from '../interfaces/storage.interface';

@Injectable()
export class FolderStorage implements Storage {
  private folderPath: string;

  initialize(config: { folderPath: string }): void {
    this.folderPath = config.folderPath;
    // Ensure the folder exists, create it if not
    if (!fs.existsSync(this.folderPath)) {
      fs.mkdirSync(this.folderPath, { recursive: true });
    }
  }

  async upload(file: Buffer, filename: string): Promise<string> {
    const filePath = path.join(this.folderPath, filename);
    fs.writeFileSync(filePath, file);
    return filePath;
  }

  async download(fileKey: string): Promise<Buffer> {
    const filePath = path.join(this.folderPath, fileKey);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }
    return fs.readFileSync(filePath);
  }

  async delete(fileKey: string): Promise<void> {
    const filePath = path.join(this.folderPath, fileKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
