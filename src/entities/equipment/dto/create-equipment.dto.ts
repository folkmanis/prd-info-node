import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { EquipmentSchema } from '../entities/equipment.entity.js';

const CreateEquipmentSchema = z.object({
  ...EquipmentSchema.shape,
  disabled: z.boolean().default(false),
});

export type CreateEquipment = z.infer<typeof CreateEquipmentSchema>;
export class CreateEquipmentDto extends createZodDto(CreateEquipmentSchema, {
  codec: true,
}) {}
