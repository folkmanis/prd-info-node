import { OmitType } from '@nestjs/mapped-types';
import { ProductionStage } from '../entities/production-stage.entity';

export class CreateProductionStageDto extends OmitType(ProductionStage, ['_id']) { }
