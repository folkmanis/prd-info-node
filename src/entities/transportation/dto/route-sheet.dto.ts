import { createZodDto } from 'nestjs-zod';
import { withIdSchema } from '../../../lib/zod-validators.js';
import {
  TransportationRouteSheetListSchema,
  TransportationRouteSheetSchema,
} from '../entities/route-sheet.entity.js';

export class RouteSheetDto extends createZodDto(
  withIdSchema(TransportationRouteSheetSchema),
  { codec: true },
) {}

export class RouteSheetListDto extends createZodDto(
  withIdSchema(TransportationRouteSheetListSchema).array(),
  { codec: true },
) {}
