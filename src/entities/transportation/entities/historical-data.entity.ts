import { z } from 'zod';

export const HistoricalDataSchema = z.object({
  lastMonth: z.number(),
  lastYear: z.number(),
  fuelRemaining: z.number(),
  lastOdometer: z.number().nonnegative(),
});
export type HistoricalData = z.infer<typeof HistoricalDataSchema>;
