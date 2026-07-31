import { z } from 'zod';
import { isoDatetimeToDate } from '../../lib/zod-validators.js';
import { createZodDto } from 'nestjs-zod';

export const LogRecordSchema = z.object({
  level: z.number(),
  timestamp: isoDatetimeToDate,
  info: z.string(),
  metadata: z.array(z.any()).optional(),
});
export type LogRecord = z.infer<typeof LogRecordSchema>;
export class LogRecordDto extends createZodDto(LogRecordSchema, {
  codec: true,
}) {}

export const LogReadResponseSchema = z.object({
  totalCount: z.number(),
  logRecords: z.array(LogRecordSchema),
});
export type LogReadResponse = z.infer<typeof LogReadResponseSchema>;
