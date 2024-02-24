import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConstantControllerUtils } from '../utilities';

@Controller('app')
@ApiTags('App')
export class RumsanAppController {
  @Get('constants/:name')
  listConstants(@Param('name') name: string) {
    return ConstantControllerUtils.getConstantController(name);
  }
}
