import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { updateOperatorsTransform } from '../../../lib/update-operators.transform.js';
import { TransportationRouteSheetSchema } from '../entities/route-sheet.entity.js';

const UpdateRouteSheetSchema = z
  .object({
    ...TransportationRouteSheetSchema.shape,
    description: z.string().nullable(),
  })
  .partial()
  .pipe(updateOperatorsTransform);
export type UpdateRouteSheet = z.infer<typeof UpdateRouteSheetSchema>;

export class UpdateRouteSheetDto extends createZodDto(UpdateRouteSheetSchema, {
  codec: true,
}) {}
