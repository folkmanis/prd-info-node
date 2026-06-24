import { z } from 'zod';
import { isoDatetimeToDate } from '../../../lib/zod-validators.js';

export const FinancialSchema = z.object({
  clientName: z.string(),
  paytraqId: z.number(),
});

export const FtpUserDataSchema = z.object({
  folder: z.string(),
  username: z.string().optional(),
  password: z.string().optional(),
});

export const CustomerContactSchema = z.object({
  email: z.email(),
});

export const ShippingAddressSchema = z.object({
  address: z.string(),
  zip: z.string(),
  country: z.string(),
  paytraqId: z.number().optional(),
  googleId: z.string().optional(),
});
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;

export const CustomerSchema = z
  .object({
    code: z.string(),
    customerName: z.string(),
    disabled: z.boolean(),
    description: z.string().optional(),
    insertedFromXmf: isoDatetimeToDate.optional(),
    financial: FinancialSchema.optional(),
    ftpUserData: FtpUserDataSchema.optional(),
    contacts: z.array(CustomerContactSchema),
    shippingAddress: ShippingAddressSchema.optional(),
  })
  .meta({ id: 'CustomerSchema' });
export type Customer = z.infer<typeof CustomerSchema>;
