import { Invoice } from '../entities/invoice.entity';
import { PartialType, PickType, OmitType, IntersectionType } from '@nestjs/mapped-types';

export const INVOICE_UPDATE_FIELDS = ['invoiceId', 'comment', 'paytraq'] as const;


export class InvoiceUpdate extends PickType(Invoice, INVOICE_UPDATE_FIELDS) { }
