import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsDaoService } from './notifications-dao.service';

describe('NotificationsDaoService', () => {
  let service: NotificationsDaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsDaoService],
    }).compile();

    service = module.get<NotificationsDaoService>(NotificationsDaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
