import { Test, TestingModule } from '@nestjs/testing';
import { PreferencesController } from './preferences.controller.js';

describe('PreferencesController', () => {
  let controller: PreferencesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreferencesController],
    }).compile();

    controller = module.get<PreferencesController>(PreferencesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
