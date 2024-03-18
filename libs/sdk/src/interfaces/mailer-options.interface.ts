import * as SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Options, TransportType } from '../types';
import { TemplateAdapter } from './template-adapter.interface';

export interface MailerOptions {
  defaults?: Options;
  transport?: TransportType;
  transports?: {
    [name: string]: SMTPTransport | SMTPTransport.Options | string;
  };
  template?: {
    dir?: string;
    adapter?: TemplateAdapter;
    options?: { [name: string]: any };
  };
  options?: { [name: string]: any };
  preview?: Partial<{
    dir: string;
    open: boolean | { wait: boolean; app: string | string[] };
  }>;
}
