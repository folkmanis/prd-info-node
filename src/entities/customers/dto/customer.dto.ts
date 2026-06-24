import { createZodDto } from 'nestjs-zod';
import { CustomerSchema } from '../entities/customer.entity.js';
import { withIdSchema } from '../../../lib/zod-validators.js';

export class CustomerDto extends createZodDto(withIdSchema(CustomerSchema), {
  codec: true,
}) {}
