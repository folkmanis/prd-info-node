import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { objectToUpdate } from '../../../lib/zod-validators.js';
import {
  MaterialPricesSchema,
  MaterialSchema,
} from '../entities/material.entity.js';

export const UpdateMaterialSchema = z
  .object({
    ...MaterialSchema.shape,
    prices: z.array(MaterialPricesSchema),
    description: z.string().nullable(),
  })
  .partial()
  .pipe(objectToUpdate);
export type UpdateMaterial = z.infer<typeof UpdateMaterialSchema>;

export class UpdateMaterialDto extends createZodDto(UpdateMaterialSchema) {}
