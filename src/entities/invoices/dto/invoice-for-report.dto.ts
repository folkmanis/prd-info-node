import { CustomerSchema } from '../../customers/entities/customer.entity.js';
import { InvoiceSchema } from '../entities/invoice.entity.js';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { JobProductSchema } from '../../jobs/entities/job-product.entity.js';
import { isoDateToDate, withIdSchema } from '../../../lib/zod-validators.js';

export const InvoiceJobSchema = z
  .object({
    jobId: z.number(),
    name: z.string(),
    receivedDate: isoDateToDate,
  })
  .extend({
    products: JobProductSchema.optional(),
  });
export type InvoiceJob = z.infer<typeof InvoiceJobSchema>;

export const InvoiceForReportSchema = InvoiceSchema.pick({
  invoiceId: true,
  customer: true,
  createdDate: true,
  products: true,
  paytraq: true,
  comment: true,
}).extend({
  total: z.number(),
  customerInfo: withIdSchema(CustomerSchema).nullish(),
  jobs: z.array(InvoiceJobSchema).optional(),
});
export type InvoiceForReport = z.infer<typeof InvoiceForReportSchema>;

export class InvoiceForReportDto extends createZodDto(InvoiceForReportSchema, {
  codec: true,
}) {}
