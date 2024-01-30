import { Module } from '@nestjs/common';
import { AuthsModule } from '@rumsan/user';
import { EmailService } from './email.service';
import { ListenerService } from './listener.service';
import { SlackService } from './slack.service';

@Module({
  imports: [AuthsModule],
  providers: [ListenerService, EmailService, SlackService],
})
export class ListenerModule {}
