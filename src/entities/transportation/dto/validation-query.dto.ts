import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { idToObjectId, stringToInt } from '../../../lib/zod-validators.js';

export const RouteSheetValidationQuerySchema = z
  .object({
    year: stringToInt,
    month: stringToInt,
    vehicle: idToObjectId,
    driver: idToObjectId,
  })
  .transform(({ vehicle, driver, ...query }) => ({
    ...query,
    'vehicle._id': vehicle,
    'driver._id': driver,
  }));
export type RouteSheetValidationQuery = z.infer<
  typeof RouteSheetValidationQuerySchema
>;

export class RouteSheetValidationQueryDto extends createZodDto(
  RouteSheetValidationQuerySchema,
  { codec: true },
) {}
