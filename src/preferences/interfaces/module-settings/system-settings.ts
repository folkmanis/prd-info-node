import { z } from 'zod';

export const SystemSettingsSchema = z.object({
  menuExpandedByDefault: z.boolean(),
  hostname: z.string(),
  companyName: z.string(),
  mapId: z.string().nullable().optional(), // TODO remove null, when config refactor is done
});
export type SystemSettings = z.infer<typeof SystemSettingsSchema>;
