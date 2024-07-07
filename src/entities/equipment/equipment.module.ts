import { Module } from '@nestjs/common';
import { EquipmentController } from './equipment.controller.js';
import { EquipmentDaoService } from './dao/equipment-dao.service.js';

@Module({
  controllers: [EquipmentController],
  providers: [EquipmentDaoService],
})
export class EquipmentModule { }
