import { z } from 'zod';

export const ProductCategorySchema = z.object({
  category: z.string(),
  description: z.string(),
});
export type ProductCategory = z.infer<typeof ProductCategorySchema>;

export const JobStateSchema = z.object({
  state: z.number(),
  description: z.string(),
});
export type JobState = z.infer<typeof JobStateSchema>;

export const ProductUnitSchema = z.object({
  shortName: z.string(),
  description: z.string(),
  disabled: z.boolean(),
});
export type ProductUnit = z.infer<typeof ProductUnitSchema>;

export const JobsSettingsSchema = z.object({
  productCategories: z.array(ProductCategorySchema),
  jobStates: z.array(JobStateSchema),
  productUnits: z.array(ProductUnitSchema),
  jobRootPath: z.string(),
});
export type JobsSettings = z.infer<typeof JobsSettingsSchema>;
