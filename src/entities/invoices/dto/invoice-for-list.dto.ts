import { createZodDto } from 'nestjs-zod';
import { InvoiceSchema } from '../entities/invoice.entity.js';
import { z } from 'zod';

export const InvoiceForListSchema = InvoiceSchema.pick({
  createdDate: true,
  customer: true,
  invoiceId: true,
}).extend({
  totals: z.object({
    count: z.number(),
    sum: z.number(),
  }),
});
export type InvoiceForList = z.infer<typeof InvoiceForListSchema>;
export class InvoiceForListDto extends createZodDto(InvoiceForListSchema, {
  codec: true,
}) {}
