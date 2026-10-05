import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ProductionStageSchema } from '../entities/production-stage.entity.js';

const CreateProductionStageSchema = z.object({
  ...ProductionStageSchema.shape,
  disabled: z.boolean().default(false),
});
export type CreateProductionStage = z.infer<typeof CreateProductionStageSchema>;

export class CreateProductionStageDto extends createZodDto(
  CreateProductionStageSchema,
  { codec: true },
) {}
