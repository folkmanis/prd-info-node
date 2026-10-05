import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const CalculatedDistanceSchema = z.object({
  distance: z.number(),
});
export type CalculatedDistance = z.infer<typeof CalculatedDistanceSchema>;

export class CalculatedDistanceDto extends createZodDto(
  CalculatedDistanceSchema,
  { codec: true },
) {}
