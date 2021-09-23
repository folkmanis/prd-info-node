import { Test, TestingModule } from '@nestjs/testing';
import { XmfSearchController } from './xmf-search.controller';
import { XmfSearchService } from './xmf-search.service';

describe('XmfSearchController', () => {
  let controller: XmfSearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [XmfSearchController],
      providers: [XmfSearchService],
    }).compile();

    controller = module.get<XmfSearchController>(XmfSearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
