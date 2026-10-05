import { createZodDto } from 'nestjs-zod';
import { withIdSchema } from '../../../lib/zod-validators.js';
import {
  TransportationDriverListSchema,
  TransportationDriverSchema,
} from '../entities/driver.entity.js';

export class DriverDto extends createZodDto(
  withIdSchema(TransportationDriverSchema),
  { codec: true },
) {}

export class DriverListDto extends createZodDto(
  withIdSchema(TransportationDriverListSchema).array(),
  { codec: true },
) {}
