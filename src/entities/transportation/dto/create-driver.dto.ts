import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TransportationDriverSchema } from '../entities/driver.entity.js';

const CreateDriverSchema = z.object({
  ...TransportationDriverSchema.shape,
  disabled: z.boolean().default(false),
});
export type CreateDriver = z.infer<typeof CreateDriverSchema>;

export class CreateDriverDto extends createZodDto(CreateDriverSchema, {
  codec: true,
}) {}
