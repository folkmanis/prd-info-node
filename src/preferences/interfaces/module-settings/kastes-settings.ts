import { z } from 'zod';

export const KastesColorsSettingsSchema = z.object({
  rose: z.string(),
  white: z.string(),
  yellow: z.string(),
});

export const KastesSettingsSchema = z.object({
  colors: KastesColorsSettingsSchema,
});
export type KastesSettings = z.infer<typeof KastesSettingsSchema>;

export const Colors = KastesColorsSettingsSchema.keyof();
export type Colors = z.infer<typeof Colors>;
export const COLORS = Colors.options;
