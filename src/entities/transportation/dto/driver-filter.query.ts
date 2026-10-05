import { Filter } from 'mongodb/mongodb.js';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { regexSearch, stringToInt } from '../../../lib/zod-validators.js';
import { TransportationDriver } from '../entities/driver.entity.js';

export const DriverQuerySchema = z
  .object({
    start: stringToInt,
    limit: stringToInt,
    name: regexSearch,
    disabled: z.stringbool(),
  })
  .partial()
  .transform(({ start, limit, disabled, ...query }) => {
    const filter: Filter<TransportationDriver> = { ...query };
    if (!disabled) {
      filter.$or = [{ disabled: { $exists: false } }, { disabled: false }];
    }
    return {
      start: start ?? 0,
      limit,
      filter,
    };
  });
export type DriverQuery = z.infer<typeof DriverQuerySchema>;
export class DriverQueryDto extends createZodDto(DriverQuerySchema, {
  codec: true,
}) {}
