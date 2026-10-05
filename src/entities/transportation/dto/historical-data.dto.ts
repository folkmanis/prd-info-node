import { createZodDto } from 'nestjs-zod';
import { HistoricalDataSchema } from '../entities/historical-data.entity.js';

export class HistoricalDataDto extends createZodDto(HistoricalDataSchema, {
  codec: true,
}) {}
