import { Test, TestingModule } from '@nestjs/testing';
import { KastesService } from './kastes.service';

describe('KastesService', () => {
  let service: KastesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KastesService],
    }).compile();

    service = module.get<KastesService>(KastesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
