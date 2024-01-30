import {
  DynamicModule,
  ForwardReference,
  InjectionToken,
  OptionalFactoryDependency,
  Provider,
  Type,
} from '@nestjs/common';

// export interface IQueueConfig<U = QueueOptions> {
//   config: U;
// }

export interface IQueueModuleOptions<U, V> {
  imports?: Array<
    Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference
  >;
  global: boolean;
  providers?: Provider[];
  exports?: Provider[];
  transport?: V;
  useFactory?: (...args: any[]) => U | Promise<U>;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
  config?: 'useFactory' extends keyof this ? U | undefined : U; // <-- make config optional when useFactory is defined
}
