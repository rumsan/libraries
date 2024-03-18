import { SendMailOptions } from 'nodemailer';
import * as DKIM from 'nodemailer/lib/dkim';
import { Attachment } from 'nodemailer/lib/mailer';
import { TextEncoding } from '../types';

export interface Address {
  name: string;
  address: string;
}

export interface AttachmentLikeObject {
  path: string;
}

export interface ISendMailOptions extends SendMailOptions {
  to?: string | Address | Array<string | Address>;
  cc?: string | Address | Array<string | Address>;
  bcc?: string | Address | Array<string | Address>;
  replyTo?: string | Address | Array<string | Address>;
  inReplyTo?: string | Address;
  from?: string | Address;
  subject?: string;
  text?: string | Buffer | AttachmentLikeObject;
  html?: string | Buffer;
  sender?: string | Address;
  raw?: string | Buffer;
  textEncoding?: TextEncoding;
  encoding?: string;
  references?: string | string[];
  date?: Date | string;
  headers?: {
    [key: string]: string | string[] | { prepared: boolean; value: string };
  };
  context?: {
    [name: string]: any;
  };
  transporterName?: string;
  template?: string;
  attachments?: Attachment[];
  dkim?: DKIM.Options;
}
