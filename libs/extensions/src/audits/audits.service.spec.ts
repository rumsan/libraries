import { Test } from '@nestjs/testing';
import { AuditService } from './audits.service';

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuditService],
    }).compile();

    service = module.get(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
