import { Inject } from '@nestjs/common';
import { MAILER_OPTIONS } from '@rumsan/sdk/constants';
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import {
  MailerTransportFactory as IMailerTransportFactory,
  MailerOptions,
} from '../../../sdk/src/interfaces';
import { TransportType } from '../../../sdk/src/types';

export class MailerTransportFactory implements IMailerTransportFactory {
  constructor(
    @Inject(MAILER_OPTIONS) private readonly options: MailerOptions,
  ) {}

  public createTransport(opts?: TransportType): Mail {
    return createTransport(
      opts || this.options.transport,
      this.options.defaults,
    );
  }
}
