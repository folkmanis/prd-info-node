import { z } from 'zod';

export const PaytraqConnectionParamsSchema = z.object({
  connectUrl: z.string(),
  connectKey: z.string(),
  apiUrl: z.string(),
  apiKey: z.string(),
  apiToken: z.string(),
  invoiceUrl: z.string(),
});
export type PaytraqConnectionParams = z.infer<typeof PaytraqConnectionParamsSchema>;

export const PaytraqSettingsSchema = z.object({
  enabled: z.boolean(),
  connectionParams: PaytraqConnectionParamsSchema.nullable(),
});
export type PaytraqSettings = z.infer<typeof PaytraqSettingsSchema>;
