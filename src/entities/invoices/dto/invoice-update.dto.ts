import { Invoice } from '../entities/invoice.entity';
import { PartialType, PickType } from '@nestjs/mapped-types';

export const INVOICE_UPDATE_FIELDS = ['comment', 'paytraq'] as const;

export class InvoiceUpdate extends PartialType(
  PickType(Invoice, INVOICE_UPDATE_FIELDS),
) {}
