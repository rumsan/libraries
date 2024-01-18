import { Test } from '@nestjs/testing';
import { DocmanService } from './docman.service';

describe('DocmanService', () => {
  let service: DocmanService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [DocmanService],
    }).compile();

    service = module.get(DocmanService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
