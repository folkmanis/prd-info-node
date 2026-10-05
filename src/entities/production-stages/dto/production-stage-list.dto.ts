import { createZodDto } from 'nestjs-zod';
import { ProductionStageListSchema } from '../entities/production-stage.entity.js';
import { withIdSchema } from '../../../lib/zod-validators.js';

export class ProductionStageListDto extends createZodDto(
  withIdSchema(ProductionStageListSchema).array(),
  { codec: true },
) {}
