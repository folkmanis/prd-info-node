import { Test, TestingModule } from '@nestjs/testing';
import { PaytraqDaoService } from './paytraq-dao.service.js';

describe('PaytraqDaoService', () => {
  let service: PaytraqDaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaytraqDaoService],
    }).compile();

    service = module.get<PaytraqDaoService>(PaytraqDaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
