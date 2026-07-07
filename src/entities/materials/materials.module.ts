import { Module } from '@nestjs/common';
import { MaterialsController } from './materials.controller.js';
import {
  MATERIALS_COLLECTION,
  provideMaterialsCollection,
} from './dao/materials-collection.provider.js';
import { MaterialsDaoService } from './dao/materials-dao.service.js';
import { MaterialsService } from './materials.service.js';

@Module({
  controllers: [MaterialsController],
  providers: [
    provideMaterialsCollection,
    MaterialsDaoService,
    MaterialsService,
  ],
  exports: [MATERIALS_COLLECTION],
})
export class MaterialsModule {}
