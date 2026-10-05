import { z } from 'zod';
import { sanitizedFileName } from '../../../lib/filename-functions.js';

export const DropFolderSchema = z.object({
  path: sanitizedFileName.array(),
  customers: z.string().array(),
});
export type DropFolder = z.infer<typeof DropFolderSchema>;
