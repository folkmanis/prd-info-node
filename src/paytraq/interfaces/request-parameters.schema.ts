import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RequestParametersSchema = z.strictObject({
  page: z.number().int().positive().optional(),
  query: z.string().optional(),
});

export type RequestParameters = z.infer<typeof RequestParametersSchema>;

export class RequestParametersDto extends createZodDto(
  RequestParametersSchema,
) {}
