// app.controller.ts

interface IFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DocmanService } from '@rumsan/docman';

@Controller('app')
export class DocController {
  constructor(private readonly docManService: DocmanService) {}

  @Post('doc/upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(@UploadedFiles() files: IFile[]): Promise<string> {
    console.log(files);
    const filename = files[1].originalname;
    await this.docManService.upload(files[1].buffer, filename);

    // You might want to return some response indicating success
    return 'File uploaded successfully.';
  }
}
