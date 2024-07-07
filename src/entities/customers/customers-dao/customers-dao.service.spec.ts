import { Test, TestingModule } from '@nestjs/testing';
import { CustomersDaoService } from './customers-dao.service.js';

describe('CustomersDaoService', () => {
  let service: CustomersDaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomersDaoService],
    }).compile();

    service = module.get<CustomersDaoService>(CustomersDaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
