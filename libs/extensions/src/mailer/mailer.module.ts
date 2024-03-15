import { DynamicModule, Module } from '@nestjs/common';
import { MailerAsyncOptions, MailerOptions } from '../../../sdk/src/interfaces';
import { MailerCoreModule } from './mailer-core.module';
@Module({})
export class MailerModule {
  public static forRoot(options?: MailerOptions): DynamicModule {
    return {
      module: MailerModule,
      imports: [MailerCoreModule.forRoot(options!)],
    };
  }

  public static forRootAsync(options: MailerAsyncOptions): DynamicModule {
    return {
      module: MailerModule,
      imports: [MailerCoreModule.forRootAsync(options)],
    };
  }
}
