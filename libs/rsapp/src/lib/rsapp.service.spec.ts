import { Test } from '@nestjs/testing';
import { RumsanAppService } from './rsapp.service';

describe('RumsanAppService', () => {
  let service: RumsanAppService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [RumsanAppService],
    }).compile();

    service = module.get(RumsanAppService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
