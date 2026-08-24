import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { updateOperatorsTransform } from '../../../lib/update-operators.transform.js';
import { isoDatetimeToDate } from '../../../lib/zod-validators.js';
import {
  CustomerContactSchema,
  FinancialSchema,
  FtpUserDataSchema,
  ShippingAddressSchema,
} from '../entities/customer.entity.js';

const UpdateCustomerSchema = z
  .object({
    code: z.string().nullable(),
    disabled: z.boolean(),
    description: z.string().nullable(),
    insertedFromXmf: isoDatetimeToDate.nullable(),
    financial: FinancialSchema.nullable(),
    ftpUserData: FtpUserDataSchema.nullable(),
    contacts: z.array(CustomerContactSchema).nullable(),
    shippingAddress: ShippingAddressSchema.nullable(),
  })
  .partial()
  .pipe(updateOperatorsTransform);
export type UpdateCustomerInput = z.input<typeof UpdateCustomerSchema>;
export type UpdateCustomer = z.infer<typeof UpdateCustomerSchema>;

export class UpdateCustomerDto extends createZodDto(UpdateCustomerSchema, {
  codec: true,
}) {}
