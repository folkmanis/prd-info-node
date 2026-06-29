import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ValidationResultSchema = z.object({
  valid: z.boolean(),
  property: z.string(),
  value: z.any(),
});
export type ValidationResult = z.infer<typeof ValidationResultSchema>;

export class ValidationResultDto extends createZodDto(ValidationResultSchema) {}
