import { Filter } from 'mongodb';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ProductQuerySchema = z
  .object({
    disabled: z.stringbool().default(true),
    start: z.coerce.number().default(0),
    limit: z.coerce.number().default(1000),
    name: z.string().optional(),
  })
  .transform(({ start, limit, ...query }) => {
    const filter: Filter<any> = {};
    if (!query.disabled) {
      filter.$or = [{ inactive: null }, { inactive: false }];
    }
    if (query.name) {
      filter.name = new RegExp(query.name, 'i');
    }

    return {
      start,
      limit,
      filter,
    };
  });

export class ProductQueryDto extends createZodDto(ProductQuerySchema) {}
