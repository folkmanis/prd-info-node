import { Filter } from 'mongodb';
import { z } from 'zod';
import { regexSearch, stringToInt } from '../../../lib/zod-validators.js';

import { ProductionStage } from '../entities/production-stage.entity.js';
import { createZodDto } from 'nestjs-zod';

export const ProductionStageQuerySchema = z
  .object({
    start: stringToInt,
    limit: stringToInt,
    name: regexSearch,
    disabled: z.stringbool(),
  })
  .partial()
  .transform(({ start, limit, ...query }) => {
    const filter: Filter<ProductionStage> = {};
    if (!query.disabled) {
      filter.$or = [{ disabled: { $exists: false } }, { disabled: false }];
    }
    if (query.name) {
      filter.name = query.name;
    }
    return { start: start ?? 0, limit, filter };
  });
export type ProductionStageQuery = z.infer<typeof ProductionStageQuerySchema>;
export class ProductionStageQueryDto extends createZodDto(
  ProductionStageQuerySchema,
  { codec: true },
) {}
