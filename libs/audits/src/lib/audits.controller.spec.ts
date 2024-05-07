import { Test } from '@nestjs/testing';
import { AuditsController } from './audits.controller';
import { AuditsService } from './audits.service';

describe('AuditsController', () => {
  let controller: AuditsController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuditsService],
      controllers: [AuditsController],
    }).compile();

    controller = module.get(AuditsController);
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });
});
