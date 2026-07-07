import { createZodDto } from 'nestjs-zod';
import { withIdSchema } from '../../../lib/zod-validators.js';
import { MaterialSchema } from '../entities/material.entity.js';
import { z } from 'zod';

const MaterialsListSchema = withIdSchema(MaterialSchema).pick({
  _id: true,
  name: true,
  description: true,
  category: true,
  inactive: true,
  units: true,
});
export type MaterialsList = z.infer<typeof MaterialsListSchema>;

export class MaterialsListDto extends createZodDto(MaterialsListSchema, {
  codec: true,
}) {}
