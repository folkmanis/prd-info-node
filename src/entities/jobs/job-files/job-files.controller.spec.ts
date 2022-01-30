import { Test, TestingModule } from '@nestjs/testing';
import { JobFilesController } from './job-files.controller';

describe('JobFilesController', () => {
  let controller: JobFilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobFilesController],
    }).compile();

    controller = module.get<JobFilesController>(JobFilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
