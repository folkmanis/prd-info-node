import { Test, TestingModule } from '@nestjs/testing';
import { LoggerDaoService } from './logger-dao.service.js';

describe('LoggerDaoService', () => {
  let service: LoggerDaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerDaoService],
    }).compile();

    service = module.get<LoggerDaoService>(LoggerDaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
