import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { InvoiceSchema } from '../entities/invoice.entity.js';

export const InvoiceUpdateShema = InvoiceSchema.pick({
  comment: true,
  paytraq: true,
}).partial();
export type InvoiceUpdate = z.infer<typeof InvoiceUpdateShema>;

export class InvoiceUpdateDto extends createZodDto(InvoiceUpdateShema) {}
