import { Test, TestingModule } from '@nestjs/testing';
import { ProductionStagesController } from './production-stages.controller.js';
import { ProductionStagesService } from './production-stages.service.js';

describe('ProductionStagesController', () => {
  let controller: ProductionStagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionStagesController],
      providers: [ProductionStagesService],
    }).compile();

    controller = module.get<ProductionStagesController>(
      ProductionStagesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
