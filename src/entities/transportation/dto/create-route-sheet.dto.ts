import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TransportationRouteSheetSchema } from '../entities/route-sheet.entity.js';

const CreateRouteSheetSchema = z.object({
  ...TransportationRouteSheetSchema.shape,
});
export type CreateRouteSheet = z.infer<typeof CreateRouteSheetSchema>;
export class CreateRouteSheetDto extends createZodDto(CreateRouteSheetSchema, {
  codec: true,
}) {}
