import { Test, TestingModule } from '@nestjs/testing';
import { KastesController } from './kastes.controller.js';
import { KastesService } from './kastes.service.js';

describe('KastesController', () => {
  let controller: KastesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KastesController],
      providers: [KastesService],
    }).compile();

    controller = module.get<KastesController>(KastesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
