import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { defaultsDeep, get } from 'lodash';
import { SentMessageInfo, Transporter } from 'nodemailer';
import * as smtpTransport from 'nodemailer/lib/smtp-transport';
import * as previewEmail from 'preview-email';
import {
  MAILER_OPTIONS,
  MAILER_TRANSPORT_FACTORY,
} from '../../../sdk/src/constants';
import {
  MailerTransportFactory as IMailerTransportFactory,
  ISendMailOptions,
  MailerOptions,
  TemplateAdapter,
} from '../../../sdk/src/interfaces';
import { MailerTransportFactory } from './mailer-transport.factory';

@Injectable()
export class MailerService {
  private transporter!: Transporter;
  private transporters = new Map<string, Transporter>();
  private templateAdapter: any;
  private initTemplateAdapter(
    templateAdapter: TemplateAdapter,
    transporter: Transporter,
  ): void {
    if (templateAdapter) {
      transporter.use('compile', (mail, callback) => {
        if (mail.data.html) {
          return callback();
        }
        return templateAdapter.compile(mail, callback, this.mailerOptions);
      });

      if (this.mailerOptions.preview) {
        transporter.use('stream', (mail, callback) => {
          return previewEmail(mail.data, this.mailerOptions.preview)
            .then(() => callback())
            .catch(callback);
        });
      }
    }
  }

  private readonly mailerLogger = new Logger(MailerService?.name);

  constructor(
    @Inject(MAILER_OPTIONS) private readonly mailerOptions: MailerOptions,
    @Optional()
    @Inject(MAILER_TRANSPORT_FACTORY)
    private readonly transportFactory: IMailerTransportFactory,
  ) {
    if (!transportFactory) {
      this.transportFactory = new MailerTransportFactory(mailerOptions);
    }

    if (
      (!mailerOptions.transport ||
        Object.keys(mailerOptions.transport).length <= 0) &&
      !mailerOptions.transports
    ) {
      throw new Error(
        'Make sure to provide a nodemailer transport configuration object, connection url or a transport plugin instance.',
      );
    }

    this.templateAdapter = get(this.mailerOptions, 'template.adapter');
    if (this.mailerOptions.preview) {
      const defaults = { open: { wait: false } };
      this.mailerOptions.preview =
        typeof this.mailerOptions.preview === 'boolean'
          ? defaults
          : defaultsDeep(this.mailerOptions.preview, defaults);
    }

    if (mailerOptions.transports) {
      Object.keys(mailerOptions.transports).forEach((name) => {
        const transporter = this.transportFactory.createTransport(
          this.mailerOptions.transports![name],
        );
        this.transporters.set(name, transporter);
        this.verifyTransporter(transporter, name);
      });
    }

    if (mailerOptions.transport) {
      this.transporter = this.transportFactory.createTransport();
      this.verifyTransporter(this.transporter);
      this.initTemplateAdapter(this.templateAdapter, this.transporter);
    }
  }

  private verifyTransporter(transporter: Transporter, name?: string): void {
    const transportName = name ? ` '${name}'` : '';
    transporter
      .verify()
      .then(() =>
        this.mailerLogger.log(`Transporter ${transportName} is ready`),
      )
      .catch((error) =>
        this.mailerLogger.error(
          `Error occurred while verifying the transporter${transportName}: ${error.message}`,
        ),
      );
  }

  public async verifyAllTransporters() {
    const transporters = [...this.transporters.values(), this.transporter];
    const transportersVerified = await Promise.all(
      transporters.map((transporter) =>
        transporter.verify().catch(() => false),
      ),
    );
    return transportersVerified.every((verified: any) => verified);
  }

  public async sendMail(
    sendMailOptions: ISendMailOptions,
  ): Promise<SentMessageInfo> {
    if (sendMailOptions.transporterName) {
      if (
        this.transporters &&
        this.transporters.get(sendMailOptions.transporterName)
      ) {
        return await this.transporters
          .get(sendMailOptions.transporterName)!
          .sendMail(sendMailOptions);
      } else {
        throw new ReferenceError(
          `Transporters object doesn't have ${sendMailOptions.transporterName} key`,
        );
      }
    } else {
      if (this.transporter) {
        return await this.transporter.sendMail(sendMailOptions);
      } else {
        throw new ReferenceError(`Transporter object is not defined`);
      }
    }
  }

  addTransport(
    transporterName: string,
    config: string | smtpTransport | smtpTransport.Options,
  ): string {
    this.transporters.set(
      transporterName,
      this.transportFactory.createTransport(config),
    );
    this.initTemplateAdapter(
      this.templateAdapter,
      this.transporters.get(transporterName)!,
    );
    return transporterName;
  }
}
