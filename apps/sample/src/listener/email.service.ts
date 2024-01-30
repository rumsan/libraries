// email.service.ts

import { Injectable } from '@nestjs/common';
import { SettingsService } from '@rumsan/settings';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {}

  initialize() {
    if (!this.transporter) {
      console.log('Initializing email service');
      this.transporter = nodemailer.createTransport({
        pool: true,
        host: SettingsService.get('SMTP.HOST'),
        port: SettingsService.get('SMTP.PORT'),
        secure: SettingsService.get('SMTP.SECURE'),
        auth: {
          user: SettingsService.get('SMTP.USER'),
          pass: SettingsService.get('SMTP.PASS'),
        },
      });
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<void> {
    this.initialize();
    const mailOptions = {
      from: SettingsService.get('SMTP.USER'), // Replace with your email
      to: to,
      subject: subject,
      text: text,
      html: html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error; // Or handle it as per your application needs
    }
  }
}
