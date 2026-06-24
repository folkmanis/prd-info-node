import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CustomerSchema } from '../entities/customer.entity.js';

const CreateCustomerSchema = CustomerSchema;
export type CreateCustomer = z.infer<typeof CreateCustomerSchema>;

export class CreateCustomerDto extends createZodDto(CreateCustomerSchema, {
  codec: true,
}) {}
