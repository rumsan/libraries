import { Module } from '@nestjs/common';
import { AppIdModule } from './app-id/app-id.module';
import { RumsanAppController } from './rsapp.controller';
import { RumsanAppService } from './rsapp.service';

@Module({
  imports: [AppIdModule],
  controllers: [RumsanAppController],
  providers: [RumsanAppService],
  exports: [RumsanAppService],
})
export class RumsanAppModule {}
