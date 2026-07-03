import { z } from 'zod';

const ShippingAddressSchema = z.object({
  address: z.string(),
  zip: z.string(),
  country: z.string(),
  paytraqId: z.number().optional(),
  googleId: z.string().optional(),
});

const FuelTypeSchema = z.object({
  type: z.string(),
  description: z.string(),
  units: z.string(),
});

export const TransportationSettingsSchema = z.object({
  shippingAddress: ShippingAddressSchema.nullable(),
  fuelTypes: z.array(FuelTypeSchema),
});
export type TransportationSettings = z.infer<
  typeof TransportationSettingsSchema
>;
