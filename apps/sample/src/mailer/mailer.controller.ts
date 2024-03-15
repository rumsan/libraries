import { Controller, Post } from "@nestjs/common";
import { MailerService } from "./mailer.service";

@Controller('mailer')
export class MailerController {
    constructor(private readonly mailerService: MailerService) { }

    @Post()
    async sendMail() {
        return await this.mailerService.sendMail();
    }
}