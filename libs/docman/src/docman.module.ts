import { DynamicModule, Global, Module } from '@nestjs/common';
import { DocmanService } from './docman.service';
import { IStorage } from './interfaces/storage.interface';

@Global()
@Module({
  providers: [DocmanService],
  exports: [DocmanService],
})
export class DocmanModule {
  static forRoot(storageConfig: {
    storage: IStorage;
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
