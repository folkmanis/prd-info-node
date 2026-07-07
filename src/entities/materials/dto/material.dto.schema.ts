import { createZodDto } from 'nestjs-zod';
import { withIdSchema } from '../../../lib/zod-validators.js';
import { MaterialSchema } from '../entities/material.entity.js';

export class MaterialDto extends createZodDto(withIdSchema(MaterialSchema), {
  codec: true,
}) {}
