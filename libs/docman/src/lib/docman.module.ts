import { DynamicModule, Global, Module } from '@nestjs/common';
import { Storage } from '../interfaces/storage.interface';
import { DocmanService } from './docman.service';

@Global()
@Module({
  providers: [DocmanService],
  exports: [DocmanService],
})
export class DocmanModule {
  static forRoot(storageConfig: {
    storage: Storage;
    config: any;
  }): DynamicModule {
    return {
      module: DocmanModule,
      providers: [
        {
          provide: 'STORAGE',
          useValue: {
            transport: storageConfig.storage,
            config: storageConfig.config,
          },
        },
      ],
    };
  }
}
