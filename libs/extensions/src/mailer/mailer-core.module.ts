import {
  DynamicModule,
  Global,
  Module,
  Provider,
  ValueProvider,
} from '@nestjs/common';
import { MAILER_OPTIONS } from '../../../sdk/src/constants';
import {
  MailerAsyncOptions,
  MailerOptions,
  MailerOptionsFactory,
} from '../../../sdk/src/interfaces';
import { MailerService } from './mailer.service';

@Global()
@Module({})
export class MailerCoreModule {
  public static forRoot(options: MailerOptions): DynamicModule {
    const MailerOptionsProvider: ValueProvider<MailerOptions> = {
      provide: MAILER_OPTIONS,
      useValue: options,
    };

    return {
      module: MailerCoreModule,
      providers: [MailerOptionsProvider, MailerService],
      exports: [MailerService],
    };
  }

  public static forRootAsync(options: MailerAsyncOptions): DynamicModule {
    const providers: Provider[] = this.createAsyncProviders(options);
    return {
      module: MailerCoreModule,
      providers: [
        ...providers,
        MailerService,
        ...(options.extraProviders || []),
      ],
      imports: options.imports,
      exports: [MailerService],
    };
  }

  private static createAsyncProviders(options: MailerAsyncOptions): Provider[] {
    const providers: Provider[] = [this.createAsyncOptionsProvider(options)];

    if (options.useClass) {
      providers.push({
        provide: options.useClass,
        useClass: options.useClass,
      });
    }
    return providers;
  }

  public static createAsyncOptionsProvider(
    options: MailerAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: MAILER_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: MAILER_OPTIONS,
      useFactory: async (optionsFactory: MailerOptionsFactory) => {
        return optionsFactory.createMailerOptions();
      },
      inject: [options?.useExisting! || options?.useClass!],
    };
  }
}
