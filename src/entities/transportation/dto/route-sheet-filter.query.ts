import { Filter } from 'mongodb/mongodb.js';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  idToObjectId,
  regexSearch,
  stringToArray,
  stringToInt,
} from '../../../lib/zod-validators.js';
import { TransportationRouteSheet } from '../entities/route-sheet.entity.js';

export const RouteSheetQuerySchema = z
  .object({
    start: stringToInt,
    limit: stringToInt,
    name: regexSearch,
    disabled: z.stringbool(),
    fuelTypes: stringToArray(z.string()),
    vehicleId: idToObjectId,
    year: stringToInt,
    month: stringToInt,
  })
  .partial()
  .transform(({ start, limit, disabled, fuelTypes, vehicleId, ...query }) => {
    const filter: Filter<TransportationRouteSheet> = { ...query };
    if (!disabled) {
      filter.$or = [{ disabled: { $exists: false } }, { disabled: false }];
    }
    if (fuelTypes && fuelTypes.length > 0) {
      filter['vehicle.fuelType.type'] = { $in: fuelTypes };
    }
    if (vehicleId) {
      filter['vehicle._id'] = vehicleId;
    }

    return {
      start: start ?? 0,
      limit,
      filter,
    };
  });
export type RouteSheetQuery = z.infer<typeof RouteSheetQuerySchema>;
export class RouteSheetQueryDto extends createZodDto(RouteSheetQuerySchema, {
  codec: true,
}) {}
