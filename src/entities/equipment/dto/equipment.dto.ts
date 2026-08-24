import { createZodDto } from 'nestjs-zod';
import { EquipmentSchema } from '../entities/equipment.entity.js';
import { withIdSchema } from '../../../lib/zod-validators.js';

export class EquipmentDto extends createZodDto(withIdSchema(EquipmentSchema), {
  codec: true,
}) {}
