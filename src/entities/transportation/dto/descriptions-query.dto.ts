import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { stringToInt } from '../../../lib/zod-validators.js';

const DescriptionsQuerySchema = z.object({
  limit: stringToInt.default(10),
  includeDocumentsCount: stringToInt.default(100),
});
export type DescriptionsQuery = z.infer<typeof DescriptionsQuerySchema>;

export class DescriptionsQueryDto extends createZodDto(
  DescriptionsQuerySchema,
  { codec: true },
) {}
