import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { updateOperatorsTransform } from '../../../lib/update-operators.transform.js';
import { TransportationDriverSchema } from '../entities/driver.entity.js';

const UpdateDriverSchema = z
  .object({
    ...TransportationDriverSchema.shape,
    description: z.string().nullable(),
  })
  .partial()
  .pipe(updateOperatorsTransform);
export type UpdateDriver = z.infer<typeof UpdateDriverSchema>;
export class UpdateDriverDto extends createZodDto(UpdateDriverSchema, {
  codec: true,
}) {}
