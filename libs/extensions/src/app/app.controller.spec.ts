import { Test } from '@nestjs/testing';
import { RumsanAppController } from './app.controller';
import { RumsanAppService } from './app.service';

describe('RumsanAppController', () => {
  let controller: RumsanAppController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [RumsanAppService],
      controllers: [RumsanAppController],
    }).compile();

    controller = module.get(RumsanAppController);
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });
});
