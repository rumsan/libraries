import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateApplicationDto } from './dtos/create-app.dto';
import { RumsanAppService } from './rsapp.service';

@Controller('apps')
@ApiTags('Applications')
export class RumsanAppController {
  constructor(private readonly appService: RumsanAppService) {}

  @Post()
  create(@Body() createAppDto: CreateApplicationDto) {
    return this.appService.create(createAppDto);
  }

  @Get()
  findAll() {
    return this.appService.findAll();
  }
}
