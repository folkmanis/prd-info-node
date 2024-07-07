import { PartialType } from '@nestjs/mapped-types';
import { CreateProductionStageDto } from './create-production-stage.dto.js';

export class UpdateProductionStageDto extends PartialType(
  CreateProductionStageDto,
) { }
