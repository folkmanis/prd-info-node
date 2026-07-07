import { z } from 'zod';

export const MaterialPricesSchema = z.object({
  min: z.number().min(0),
  price: z.number(),
  description: z.string().optional(),
});
export type MaterialPrices = z.infer<typeof MaterialPricesSchema>;

export const MaterialSchema = z.object({
  name: z.string(),
  units: z.string(),
  category: z.string(),
  inactive: z.boolean(),
  fixedPrice: z.number(),
  prices: z.array(MaterialPricesSchema),
  description: z.string().optional(),
});

export type Material = z.infer<typeof MaterialSchema>;
