import { Module } from '@nestjs/common';
import { MaterialsController } from './materials.controller.js';
import { materialsCollectionProvider } from './dao/materials-collection.provider.js';
import { MaterialsDaoService } from './dao/materials-dao.service.js';

@Module({
  controllers: [MaterialsController],
  providers: [materialsCollectionProvider, MaterialsDaoService],
})
export class MaterialsModule { }
