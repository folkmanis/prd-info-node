import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { updateOperatorsTransform } from '../../../lib/update-operators.transform.js';

const UpdateEquipmentSchema = z
  .object({
    name: z.string(),
    disabled: z.boolean(),
    description: z.string().nullable(),
  })
  .partial()
  .pipe(updateOperatorsTransform);
export type UpdateEquipment = z.infer<typeof UpdateEquipmentSchema>;

export class UpdateEquipmentDto extends createZodDto(UpdateEquipmentSchema, {
  codec: true,
}) {}
