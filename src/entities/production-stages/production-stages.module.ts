import { Module } from '@nestjs/common';
import { ProductionStagesController } from './production-stages.controller.js';
import { provideProductionStagesCollection } from './dao/production-stages.provider.js';
import { ProductionStagesDaoService } from './dao/production-stages-dao.service.js';
import { ProductionStagesService } from './production-stages.service.js';

@Module({
  controllers: [ProductionStagesController],
  providers: [
    provideProductionStagesCollection,
    ProductionStagesDaoService,
    ProductionStagesService,
  ],
})
export class ProductionStagesModule {}
