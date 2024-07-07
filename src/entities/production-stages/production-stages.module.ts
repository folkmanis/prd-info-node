import { Module } from '@nestjs/common';
import { ProductionStagesController } from './production-stages.controller.js';
import { productionStagesProvidder } from './dao/production-stages.provider.js';
import { ProductionStagesDaoService } from './dao/production-stages-dao.service.js';

@Module({
  controllers: [ProductionStagesController],
  providers: [productionStagesProvidder, ProductionStagesDaoService],
})
export class ProductionStagesModule { }
