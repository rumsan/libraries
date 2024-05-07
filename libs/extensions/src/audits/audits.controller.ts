import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuditService } from './audits.service';

@Controller('audits')
@ApiTags('audits')
export class AuditController {
  constructor(private service: AuditService) {}

  @Get('')
  list() {
    return this.service.listAudits();
  }

  @Get('grouped')
  listGrouped() {
    return this.service.listGroupedAudits();
  }
}
