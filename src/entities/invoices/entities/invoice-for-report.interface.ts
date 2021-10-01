import { OmitType, IntersectionType, PickType } from '@nestjs/mapped-types';
import { Invoice } from './invoice.entity';
import { Type } from 'class-transformer';
import { IsMongoId, IsString, IsDate, IsInt, IsOptional, ValidateNested, IsNumber } from 'class-validator';
import { Customer } from '../../customers/entities/customer.entity';

import { JobOneProduct } from "../../jobs/entities/job-one-product";

export class JobBase extends PickType(JobOneProduct, ['products', 'receivedDate', 'name']) { }

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
    ReportData
) { }

