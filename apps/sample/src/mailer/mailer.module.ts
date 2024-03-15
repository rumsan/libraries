import { Module } from '@nestjs/common';
import {
  HandlebarsAdapter,
  MailerModule as ImportedMailerModule,
} from '@rumsan/extensions/mailer';
@Module({
  imports: [
    ImportedMailerModule.forRootAsync({
      useFactory: async () => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: 'manjik.shrestha@rumsan.com',
            pass: 'uuxxaqfbftlknelb',
          },
        },
        defaults: { from: '"No Reply" <no-reply@rumsan.com>' },
        template: {
          dir: __dirname + '/assets/templates',
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
    }),
  ],
})
export class MailerModule {}
