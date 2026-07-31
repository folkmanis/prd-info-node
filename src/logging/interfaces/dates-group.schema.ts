import { z } from 'zod';

export const DatesGroupSchema = z.string();
export type DatesGroup = z.infer<typeof DatesGroupSchema>;
