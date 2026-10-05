import { z } from 'zod';

export const TransportationDriverSchema = z.object({
  name: z.string().nonempty(),
  disabled: z.boolean(),
  description: z.string().optional(),
});
export type TransportationDriver = z.infer<typeof TransportationDriverSchema>;

export const TransportationDriverListSchema = TransportationDriverSchema.pick({
  name: true,
  disabled: true,
});
export type TransportationDriverList = z.infer<
  typeof TransportationDriverListSchema
>;
