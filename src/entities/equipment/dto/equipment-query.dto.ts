import { Filter } from 'mongodb';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { regexSearch, stringToInt } from '../../../lib/zod-validators.js';
import { Equipment } from '../entities/equipment.entity.js';

const EquipmentQuerySchema = z
  .object({
    start: stringToInt,
    limit: stringToInt,
    name: regexSearch,
    disabled: z.stringbool(),
  })
  .partial()
  .transform(({ start, limit, ...query }) => {
    const filter: Filter<Equipment> = {};
    if (!query.disabled) {
      filter.$or = [{ disabled: { $exists: false } }, { disabled: false }];
    }
    if (query.name) {
      filter.name = query.name;
    }
    return { start: start ?? 0, limit, filter };
  });
export type EquipmentQuery = z.infer<typeof EquipmentQuerySchema>;

export class EquipmentQueryDto extends createZodDto(EquipmentQuerySchema, {
  codec: true,
}) {}
