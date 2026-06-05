import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { stringToArray, stringToInt } from '../../../lib/zod-validators.js';

const XmfJobsQuerySchema = z.object({
  search: z.string().optional(),
  customerName: stringToArray(z.string()).optional(),
  year: stringToArray(stringToInt).optional(),
  month: stringToArray(stringToInt).optional(),
  start: stringToInt.default(0),
  limit: stringToInt.default(100),
});
export type XmfJobsQuery = z.infer<typeof XmfJobsQuerySchema>;
export class XmfJobsQueryDto extends createZodDto(XmfJobsQuerySchema) {}
