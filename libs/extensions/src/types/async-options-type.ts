import { ModuleMetadata, Provider } from '@nestjs/common';

export interface AsyncOptions<T> extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory: (...args: any[]) => Promise<T> | T;
  extraProviders?: Provider[];
}
