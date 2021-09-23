import { Test, TestingModule } from '@nestjs/testing';
import { XmfSearchService } from './xmf-search.service';

describe('XmfSearchService', () => {
  let service: XmfSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [XmfSearchService],
    }).compile();

    service = module.get<XmfSearchService>(XmfSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
