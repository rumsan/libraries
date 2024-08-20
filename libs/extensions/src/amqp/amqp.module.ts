import { DynamicModule, Global, Module, ValueProvider } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';
import { AsyncOptions } from '../types/async-options-type';
import { AmqpService } from './amqp.service';

export type AmpqConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  vhost: string;
  queues: string[];
};

@Global()
@Module({
  imports: [],
  providers: [PrismaService, AmqpService],
  exports: [AmqpService],
})
export class AmqpModule {
  public static forRoot(options: AmpqConfig): DynamicModule {
    const AmqpConfigProvider: ValueProvider<AmpqConfig> = {
      provide: 'AMQP_CONFIG',
      useValue: options,
    };

    return {
      module: AmqpModule,
      providers: [AmqpConfigProvider],
      exports: [AmqpConfigProvider],
    };
  }

  static forRootAsync(options: AsyncOptions<AmpqConfig>): DynamicModule {
    const AmqpConfigProvider = {
      provide: 'AMQP_CONFIG',
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    return {
      module: AmqpModule,
      providers: [AmqpConfigProvider],
      exports: [AmqpConfigProvider],
    };
  }
}
