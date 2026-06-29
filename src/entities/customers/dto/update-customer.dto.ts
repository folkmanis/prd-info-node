import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { pickNotNull } from '../../../lib/pick-not-null.js';
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
  .transform((value) => {
    const update: Record<string, any>[] = [];
    const $set = pickNotNull(value);
    if (Object.keys($set).length > 0) {
      update.push({ $set });
    }

    const $unset = Object.entries(value)
      .filter(([_, v]) => v === null)
      .map(([k]) => k);
    if ($unset.length > 0) {
      update.push({ $unset });
    }
    return update;
  });
export type UpdateCustomerInput = z.input<typeof UpdateCustomerSchema>;
export type UpdateCustomer = z.infer<typeof UpdateCustomerSchema>;

export class UpdateCustomerDto extends createZodDto(UpdateCustomerSchema, {
  codec: true,
}) {}
