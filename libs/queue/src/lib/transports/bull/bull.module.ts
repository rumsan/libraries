import { BullModuleOptions, BullModule as RootBullModule } from '@nestjs/bull';
import { DynamicModule, Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class BullModule extends RootBullModule {
  static register(options: BullModuleOptions): DynamicModule {
    return {
      module: BullModule,
      imports: [BullModule.forRoot(options)],
    };
  }
}
