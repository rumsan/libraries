import { DynamicModule, Module, ValueProvider } from '@nestjs/common';
import { AsyncOptions } from '../types/async-options-type';
import { PgSqlService } from './pgsql.service';

export type PgConfig = {
  host: string;
  port?: number;
  user: string;
  password: string;
  database: string;
};

@Module({
  providers: [PgSqlService],
  exports: [PgSqlService],
})
export class PgSqlModule {
  public static forRoot(options: PgConfig): DynamicModule {
    const PgConfigProvider: ValueProvider<PgConfig> = {
      provide: 'PG_CONFIG',
      useValue: options,
    };

    return {
      module: PgSqlModule,
      providers: [PgConfigProvider],
      exports: [PgConfigProvider],
    };
  }

  static forRootAsync(options: AsyncOptions<PgConfig>): DynamicModule {
    const PgConfigProvider = {
      provide: 'PG_CONFIG',
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    return {
      module: PgSqlModule,
      providers: [PgConfigProvider],
      exports: [PgConfigProvider],
    };
  }
}
