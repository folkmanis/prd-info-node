import { createZodDto } from 'nestjs-zod';
import { EquipmentListSchema } from '../entities/equipment.entity.js';
import { withIdSchema } from '../../../lib/zod-validators.js';

export class EquipmentListDto extends createZodDto(
  withIdSchema(EquipmentListSchema).array(),
  { codec: true },
) {}
