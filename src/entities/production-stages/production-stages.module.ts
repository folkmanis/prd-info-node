import { Module } from '@nestjs/common';
import { ProductionStagesController } from './production-stages.controller';
import { productionStagesProvidder } from './dao/production-stages.provider';
import { ProductionStagesDaoService } from './dao/production-stages-dao.service';

@Module({
  controllers: [ProductionStagesController],
  providers: [
    productionStagesProvidder,
    ProductionStagesDaoService,
  ]
})
export class ProductionStagesModule { }
