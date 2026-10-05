import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { updateOperatorsTransform } from '../../../lib/update-operators.transform.js';
import { idToObjectId } from '../../../lib/zod-validators.js';
import { ProductionStageSchema } from '../entities/production-stage.entity.js';

const UpdateProductionStageSchema = z
  .object({
    ...ProductionStageSchema.shape,
    description: z.string().nullable(),
    defaultEquipmentId: idToObjectId.nullable(),
  })
  .partial()
  .pipe(updateOperatorsTransform);
export type UpdateProductionStage = z.infer<typeof UpdateProductionStageSchema>;

export class UpdateProductionStageDto extends createZodDto(
  UpdateProductionStageSchema,
  { codec: true },
) {}
