import { endOfDay, startOfDay } from 'date-fns';
import { Condition, Filter } from 'mongodb';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { isoDateToDate, stringToInt } from '../../lib/zod-validators.js';
import { LogRecord } from './log-record.schema.js';

export const LogQuerySchema = z
  .object({
    start: stringToInt,
    limit: stringToInt,
    level: stringToInt,
    dateTo: isoDateToDate,
    dateFrom: isoDateToDate,
  })
  .partial()
  .transform(({ start, limit, dateFrom, dateTo, level }) => {
    const filter: Filter<LogRecord> = {};
    if (dateFrom || dateTo) {
      const dates = [] as Condition<LogRecord>[];
      if (dateFrom) {
        dates.push({ timestamp: { $gte: startOfDay(dateFrom) } });
      }
      if (dateTo) {
        dates.push({ timestamp: { $lte: endOfDay(dateTo) } });
      }
      filter.$and = dates;
    }
    if (typeof level === 'number') {
      filter.level = { $lte: level };
    }
    return {
      start: start ?? 0,
      limit,
      filter,
    };
  });
export type LogQuery = z.infer<typeof LogQuerySchema>;

export class LogQueryDto extends createZodDto(LogQuerySchema, {
  codec: true,
}) {}
