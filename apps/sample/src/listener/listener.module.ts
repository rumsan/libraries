import { Module } from '@nestjs/common';
import { AuthsModule } from '@rumsan/user';
import { ListenerService } from './listener.service';

@Module({
  imports: [AuthsModule],
  providers: [ListenerService],
})
export class ListenerModule {}
