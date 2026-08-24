import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const deletedCount = z
  .number()
  .transform((value) => ({ deletedCount: value }));
export class DeletedCountDto extends createZodDto(deletedCount) {}
