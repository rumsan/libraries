// storages/s3.storage.ts

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { IStorage } from '../interfaces/storage.interface';

@Injectable()
export class S3Storage implements IStorage {
  private s3: S3Client;
  private bucketName: string;

  initialize(config: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucketName: string;
  }): void {
    this.bucketName = config.bucketName;

    this.s3 = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async upload(file: Buffer, filename: string): Promise<string> {
    const uploadParams = {
      Bucket: this.bucketName,
      Key: filename,
      Body: file,
    };

    const command = new PutObjectCommand(uploadParams);
    await this.s3.send(command);

    return filename; // Assuming you want to return the filename as the identifier
  }

  async download(fileKey: string): Promise<Buffer> {
    const getObjectParams = {
      Bucket: this.bucketName,
      Key: fileKey,
    };

    const command = new GetObjectCommand(getObjectParams);

    const { Body } = await this.s3.send(command);

    if (Body instanceof Uint8Array) {
      return Buffer.from(Body);
    } else if (typeof Body === 'string') {
      return Buffer.from(Body, 'base64');
    } else {
      // Handle other cases or throw an error if necessary
      throw new Error('Invalid type for S3 object body');
    }
  }

  async delete(fileKey: string): Promise<void> {
    const deleteObjectParams = {
      Bucket: this.bucketName,
      Key: fileKey,
    };

    const command = new DeleteObjectCommand(deleteObjectParams);
    await this.s3.send(command);
  }
}
