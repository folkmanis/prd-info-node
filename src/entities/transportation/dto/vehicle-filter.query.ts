import { Filter } from 'mongodb/mongodb.js';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  regexSearch,
  stringToArray,
  stringToInt,
} from '../../../lib/zod-validators.js';
import { TransportationVehicle } from '../entities/vehicle.entity.js';

export const VehicleQuerySchema = z
  .object({
    start: stringToInt,
    limit: stringToInt,
    name: regexSearch,
    disabled: z.stringbool(),
    licencePlate: z.string(),
    fuelTypes: stringToArray(z.string()),
  })
  .partial()
  .transform(({ start, limit, disabled, fuelTypes, ...query }) => {
    const filter: Filter<TransportationVehicle> = { ...query };
    if (!disabled) {
      filter.$or = [{ disabled: { $exists: false } }, { disabled: false }];
    }
    if (fuelTypes && fuelTypes.length > 0) {
      filter['fuelType.type'] = { $in: fuelTypes };
    }

    return {
      start: start ?? 0,
      limit,
      filter,
    };
  });
export type VehicleQuery = z.infer<typeof VehicleQuerySchema>;
export class VehicleQueryDto extends createZodDto(VehicleQuerySchema, {
  codec: true,
}) {}
