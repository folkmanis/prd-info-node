import { Test, TestingModule } from '@nestjs/testing';
import { FtpWatcherService } from './ftp-watcher.service';

describe('FtpWatcherService', () => {
  let service: FtpWatcherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FtpWatcherService],
    }).compile();

    service = module.get<FtpWatcherService>(FtpWatcherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
