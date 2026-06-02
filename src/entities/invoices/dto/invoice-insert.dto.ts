import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const InvoiceInsertSchema = z.strictObject({
  jobIds: z.array(z.number()),
  customerId: z.string(),
  detailedJobs: z.boolean().default(false),
});

export type InvoiceInsert = z.infer<typeof InvoiceInsertSchema>;

export class InvoiceInsertDto extends createZodDto(InvoiceInsertSchema) {}
