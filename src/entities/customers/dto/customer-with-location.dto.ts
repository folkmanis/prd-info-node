import { CustomerSchema } from '../entities/customer.entity.js';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { withIdSchema } from '../../../lib/zod-validators.js';

export const CustomerWithLocationSchema = CustomerSchema.pick({
  customerName: true,
  shippingAddress: true,
});
export type CustomerWithLocation = z.infer<typeof CustomerWithLocationSchema>;

export class CustomerWithLocationDto extends createZodDto(
  withIdSchema(CustomerWithLocationSchema).array(),
  { codec: true },
) {}
