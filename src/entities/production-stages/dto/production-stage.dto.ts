import { createZodDto } from 'nestjs-zod';
import { ProductionStageSchema } from '../entities/production-stage.entity.js';
import { withIdSchema } from '../../../lib/zod-validators.js';

export class ProductionStageDto extends createZodDto(
  withIdSchema(ProductionStageSchema),
  { codec: true },
) {}
