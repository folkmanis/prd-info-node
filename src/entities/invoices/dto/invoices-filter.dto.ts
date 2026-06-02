import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const InvoicesFilterSchema = z
  .object({
    customer: z.string(),
  })
  .partial();
export type InvoicesFilter = z.infer<typeof InvoicesFilterSchema>;
export class InvoicesFilterDto extends createZodDto(InvoicesFilterSchema) {}
