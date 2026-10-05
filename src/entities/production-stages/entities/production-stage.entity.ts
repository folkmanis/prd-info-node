import { z } from 'zod';
import { idToObjectId } from '../../../lib/zod-validators.js';
import { DropFolderSchema } from './drop-folder.entity.js';

export const ProductionStageSchema = z.object({
  name: z.string(),
  disabled: z.boolean(),
  description: z.string().optional(),
  defaultEquipmentId: idToObjectId.optional(),
  equipmentIds: idToObjectId.array(),
  dropFolders: DropFolderSchema.array(),
});
export type ProductionStage = z.infer<typeof ProductionStageSchema>;

export const ProductionStageListSchema = ProductionStageSchema.pick({
  name: true,
  equipmentIds: true,
  disabled: true,
});
export type ProductionStageList = z.infer<typeof ProductionStageListSchema>;
