import { z } from 'zod';

export const EquipmentSchema = z.object({
  name: z.string(),
  disabled: z.boolean(),
  description: z.string().optional(),
});
export type Equipment = z.infer<typeof EquipmentSchema>;

export const EquipmentListSchema = EquipmentSchema.omit({
  description: true,
});
export type EquipmentList = z.infer<typeof EquipmentListSchema>;
