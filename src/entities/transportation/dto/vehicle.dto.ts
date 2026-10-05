import { createZodDto } from 'nestjs-zod';
import { withIdSchema } from '../../../lib/zod-validators.js';
import {
  TransportationVehicleListSchema,
  TransportationVehicleSchema,
} from '../entities/vehicle.entity.js';

export class VehicleDto extends createZodDto(
  withIdSchema(TransportationVehicleSchema),
  { codec: true },
) {}

export class VehicleListDto extends createZodDto(
  withIdSchema(TransportationVehicleListSchema).array(),
  { codec: true },
) {}
