import { Filter } from 'mongodb';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { stringToArray, stringToInt } from '../../../lib/zod-validators.js';
import { Material } from '../entities/material.entity.js';

const MaterialQuerySchema = z
  .object({
    start: stringToInt,
    limit: stringToInt,
    name: z.string(),
    inactive: z.stringbool(),
    categories: stringToArray(z.string()),
  })
  .partial()
  .transform(({ start, limit, ...query }) => {
    const filter: Filter<Material> = {};

    if (query.name) {
      filter.name = new RegExp(query.name, 'i');
    }
    if (query.categories && query.categories.length > 0) {
      filter.category = { $in: query.categories };
    }
    if (!query.inactive) {
      filter.$or = [{ inactive: { $exists: false } }, { inactive: false }];
    }
    return { start: start ?? 0, limit, filter };
  });
export type MaterialQuery = z.infer<typeof MaterialQuerySchema>;

export class MaterialQueryDto extends createZodDto(MaterialQuerySchema, {
  codec: true,
}) {}
