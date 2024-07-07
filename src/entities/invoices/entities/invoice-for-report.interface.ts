import { IntersectionType, PickType } from '@nestjs/mapped-types';
import { Invoice } from './invoice.entity.js';
import { Type } from 'class-transformer';
import { ValidateNested, IsNumber } from 'class-validator';
import { Customer } from '../../customers/entities/customer.entity.js';

import { JobOneProduct } from '../../jobs/entities/job-one-product.js';

export class JobBase extends PickType(JobOneProduct, [
  'products',
  'receivedDate',
  'name',
]) { }

export class ReportData {
  @Type(() => JobBase)
  @ValidateNested({ each: true })
  jobs: JobBase[];

  @IsNumber()
  total: number;

  @ValidateNested()
  customerInfo: Customer;
}

export class InvoiceForReport extends IntersectionType(
  PickType(Invoice, ['invoiceId', 'customer', 'createdDate', 'products']),
  ReportData,
) { }
