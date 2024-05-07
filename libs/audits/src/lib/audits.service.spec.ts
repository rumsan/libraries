import { Test } from '@nestjs/testing';
import { AuditsService } from './audits.service';

describe('AuditsService', () => {
  let service: AuditsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuditsService],
    }).compile();

    service = module.get(AuditsService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
