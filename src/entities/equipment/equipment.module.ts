import { Module } from '@nestjs/common';
import { EquipmentController } from './equipment.controller.js';
import { EquipmentDaoService } from './dao/equipment-dao.service.js';
import { provideEquipmentCollection } from './dao/equipment-provider.js';
import { EquipmentService } from './equipment.service.js';

@Module({
  controllers: [EquipmentController],
  providers: [
    EquipmentService,
    EquipmentDaoService,
    provideEquipmentCollection,
  ],
})
export class EquipmentModule {}
