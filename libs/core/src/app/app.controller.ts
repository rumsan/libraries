import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { getConstantController } from './app.module';

@Controller('app')
@ApiTags('App')
export class RumsanAppController {
  @Get('constants/:name')
  listConstants(@Param('name') name: string) {
    return getConstantController(name);
  }
}
