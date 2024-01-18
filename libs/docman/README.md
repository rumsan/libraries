# Rumsan DocStorage

DocMan is a flexible document management library for NestJS, allowing you to manage documents using various storage services like S3, IPFS, and more.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Supported Storage Services](#supported-storage-services)
- [License](#license)

## Installation

Install the library using npm:

```bash
npm install @rumsan/docman
```

## Usage

Import the DocManModule into your NestJS application's main module.

```typescript
import { Module } from '@nestjs/common';
import { DocmanModule, IpfsStorage } from '@rumsan/docman';
import { DocController } from './doc.controller';

@Module({
  imports: [
    DocmanModule.forRoot({
      storage: new IpfsStorage(),
      config: {
        host: 'localhost',
        port: 5001,
        protocol: 'http',
      },
    }),
  ],
  controllers: [DocController],
})
export class AppModule {}
```

Inject the DocManService into your controllers or services to manage documents.

```typescript
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
```

```typescript
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
    const filename = files[1].originalname;
    await this.docManService.upload(files[1].buffer, filename);
    return 'File uploaded successfully.';
  }
}
```

## Configuration

When importing DocManModule, provide the storage service and its configuration using the forRoot method.

```typescript
DocManModule.forRoot({
  //YourStorageClass must implement IStorage
  storage: YourStorageClass,
  config: {
    // Your storage configuration here
  },
});
```

**storage**: Choose the appropriate storage class (e.g., IpfsStorage, S3Storage, FolderStorage) that implements the IStorage interface.

**config**: Provide the necessary configuration options for the chosen storage. For example, if using IpfsStorage, specify the host, port, and protocol.

## Supported Storage Services

DocMan supports various storage services for document management. Choose one of the supported services and implement the corresponding storage class.

- Folder Storage
- S3 Storage
- IPFS Storage

## License

This project is dual-licensed under the terms of both the **Commercial License** and the **GNU Affero General Public License, version 3 (AGPL-3.0)**.

- **Commercial License:** If you want to use this project for a closed-source, proprietary application, you must obtain a commercial license. To inquire about a commercial license, please contact [Rumsan Team](mailto:team@rumsan.com).

- **AGPL-3.0 License:** If you are using this project for an open-source application, you must adhere to the terms of the AGPL-3.0 license. See the [LICENSE-AGPL-3.0](https://raw.githubusercontent.com/teamdigitale/licenses/master/AGPL-3.0-or-later) file for details.

For more information on licensing options, please contact [Rumsan Team](mailto:team@rumsan.com).
