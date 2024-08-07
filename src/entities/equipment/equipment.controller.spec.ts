import { Test, TestingModule } from '@nestjs/testing';
import { EquipmentController } from './equipment.controller.js';
import { EquipmentService } from './equipment.service.js';

describe('EquipmentController', () => {
  let controller: EquipmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EquipmentController],
      providers: [EquipmentService],
    }).compile();

    controller = module.get<EquipmentController>(EquipmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
