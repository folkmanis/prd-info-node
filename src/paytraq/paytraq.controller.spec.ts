import { Test, TestingModule } from '@nestjs/testing';
import { PaytraqController } from './paytraq.controller';

describe('PaytraqController', () => {
  let controller: PaytraqController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaytraqController],
    }).compile();

    controller = module.get<PaytraqController>(PaytraqController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
