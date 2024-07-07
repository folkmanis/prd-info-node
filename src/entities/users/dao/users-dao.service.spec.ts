import { Test, TestingModule } from '@nestjs/testing';
import { UsersDaoService } from './users-dao.service.js';

describe('UsersDaoService', () => {
  let service: UsersDaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersDaoService],
    }).compile();

    service = module.get<UsersDaoService>(UsersDaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
