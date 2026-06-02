import { z } from 'zod';
import { isoDateToDate } from '../../../lib/zod-validators.js';

export const PaytraqInvoiceSchema = z.object({
  paytraqId: z.coerce.number().int(),
  documentRef: z.string(),
});
export type PaytraqInvoice = z.infer<typeof PaytraqInvoiceSchema>;

export const InvoiceProductSchema = z.object({
  _id: z.string(),
  total: z.number(),
  jobsCount: z.number(),
  count: z.number(),
  price: z.number(),
  comment: z.string().nullish(),
  paytraqId: z.number().nullish(),
});

export type InvoiceProduct = z.infer<typeof InvoiceProductSchema>;

export const InvoiceSchema = z.object({
  invoiceId: z.string(),
  customer: z.string(),
  createdDate: isoDateToDate,
  jobsId: z.array(z.coerce.number().int()),
  products: z.array(InvoiceProductSchema),
  comment: z.string().nullish(),
  paytraq: PaytraqInvoiceSchema.nullish(),
});

export type Invoice = z.infer<typeof InvoiceSchema>;

export const ProductTotalsSchema = z.object({
  _id: z.string(),
  count: z.number(),
  total: z.number(),
});
export type ProductTotals = z.infer<typeof ProductTotalsSchema>;

export const INVOICE_SCHEMA: { [key: string]: any } = {
  bsonType: 'object',
  required: ['invoiceId', 'customer'],
  properties: {
    invoiceId: {
      bsonType: 'string',
    },
    customer: {
      bsonType: 'string',
    },
    createdDate: {
      bsonType: 'date',
    },
    jobsId: {
      bsonType: 'array',
      items: {
        bsonType: 'number',
      },
    },
  },
};
