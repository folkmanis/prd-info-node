import { Filter } from 'mongodb';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { stringToInt } from '../../../lib/zod-validators.js';
import { Customer } from '../entities/customer.entity.js';

const CustomersQuerySchema = z
  .object({
    start: stringToInt,
    limit: stringToInt,
    name: z.string(),
    email: z.string(),
    disabled: z.stringbool(),
  })
  .partial()
  .transform(({ start, limit, ...query }) => {
    const filter: Filter<Customer> = {};
    if (!query.disabled) {
      filter.$or = [{ disabled: { $exists: false } }, { disabled: false }];
    }
    if (query.name) {
      filter.customerName = new RegExp(query.name, 'i');
    }
    if (query.email) {
      filter['contacts.email'] = query.email;
    }

    return { start: start ?? 0, limit, filter };
  });
export type CustomersQuery = z.infer<typeof CustomersQuerySchema>;

export class CustomersQueryDto extends createZodDto(CustomersQuerySchema) {}
