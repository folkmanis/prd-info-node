import { Module } from '@nestjs/common';
import { MaterialsController } from './materials.controller';
import { materialsCollectionProvider } from './dao/materials-collection.provider';
import { MaterialsDaoService } from './dao/materials-dao.service';

@Module({
  controllers: [
    MaterialsController
  ],
  providers: [
    materialsCollectionProvider,
    MaterialsDaoService,
  ]
})
export class MaterialsModule { }
