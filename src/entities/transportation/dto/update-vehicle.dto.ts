import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { updateOperatorsTransform } from '../../../lib/update-operators.transform.js';
import { TransportationVehicleSchema } from '../entities/vehicle.entity.js';

const UpdateVehicleSchema = z
  .object({
    ...TransportationVehicleSchema.shape,
    description: z.string().nullable(),
    passportNumber: z.string().nullable(),
    vin: z.string().nullable(),
  })
  .partial()
  .pipe(updateOperatorsTransform);
export type UpdateVehicle = z.infer<typeof UpdateVehicleSchema>;

export class UpdateVehicleDto extends createZodDto(UpdateVehicleSchema, {
  codec: true,
}) {}
