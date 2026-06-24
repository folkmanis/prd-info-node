import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { withIdSchema } from '../../../lib/zod-validators.js';
import { CustomerSchema } from '../entities/customer.entity.js';

const CustomerListSchema = withIdSchema(
  CustomerSchema.pick({
    customerName: true,
    code: true,
    disabled: true,
  }),
);
export type CustomerList = z.infer<typeof CustomerListSchema>;

export const CUSTOMERS_LIST_DEFAULT_PROJECTION =
  CustomerListSchema.keyof().options.reduce(
    (acc, curr) => ({ ...acc, [curr]: 1 }),
    {} as Record<string, any>,
  );

export class CustomerListDto extends createZodDto(CustomerListSchema, {
  codec: true,
}) {}
