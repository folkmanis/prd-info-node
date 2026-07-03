import { z } from 'zod';

export const ShippingAddressSchema = z.object({
  address: z.string(),
  zip: z.string(),
  country: z.string(),
  paytraqId: z.number().optional(),
  googleId: z.string().optional(),
});
