import * as Mail from 'nodemailer/lib/mailer';
import { TransportType } from '../types';

export interface MailerTransportFactory {
  createTransport(opts?: TransportType): Mail;
}
