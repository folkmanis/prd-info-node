import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TransportationVehicleSchema } from '../entities/vehicle.entity.js';

const CreateVehicleSchema = z.object({
  ...TransportationVehicleSchema.shape,
  disabled: z.boolean().default(false),
});
export type CreateVehicle = z.infer<typeof CreateVehicleSchema>;

export class CreateVehicleDto extends createZodDto(CreateVehicleSchema, {
  codec: true,
}) {}
