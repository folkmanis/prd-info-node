import { Module } from '@nestjs/common';
import { EquipmentController } from './equipment.controller';
import { EquipmentDaoService } from './dao/equipment-dao.service';

@Module({
  controllers: [
    EquipmentController
  ],
  providers: [
    EquipmentDaoService
  ]
})
export class EquipmentModule { }
