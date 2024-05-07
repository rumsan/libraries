import { Test } from '@nestjs/testing';
import { AuditController } from './audits.controller';
import { AuditService } from './audits.service';

describe('AuditController', () => {
  let controller: AuditController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuditService],
      controllers: [AuditController],
    }).compile();

    controller = module.get(AuditController);
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });
});
