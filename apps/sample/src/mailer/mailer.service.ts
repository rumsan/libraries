import { Injectable } from "@nestjs/common";
import { MailerService as ImportedMailerService } from "@rumsan/extensions/mailer";
@Injectable()
export class MailerService {
    constructor(private readonly mailerService: ImportedMailerService) { }
    async sendMail() {
        return this.mailerService.sendMail({
            to: "saroj@mailinator.com",
            from: 'manjik.shrestha@rumsan.com',
            subject: 'Wallet Verification Link',
            template: './wallet-verification',
            context: {
                name: "Saroj",
            },
        }); // 
    }
}