import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
    HandlebarsAdapter,
    MailerModule as ImportedMailerModule,
} from '@rumsan/extensions/mailer';
@Module({
    imports: [
        ImportedMailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],

            useFactory: async (configService: ConfigService) => ({
                transport: {
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: configService.get('EMAIL_USER'),
                        pass: configService.get('EMAIL_PASS'),
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
export class MailerModule { }
