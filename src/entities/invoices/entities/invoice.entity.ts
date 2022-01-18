import { ObjectId } from 'mongodb';
import { Type } from 'class-transformer';
import {
  IsString,
  IsDate,
  IsInt,
  IsOptional,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Customer } from '../../customers/entities/customer.entity';

export class PaytraqInvoice {
  @Type(() => Number)
  @IsInt()
  paytraqId: number;

  @IsString()
  documentRef: string;
}

export class InvoiceProduct {
  @IsString()
  _id: string;

  @IsNumber()
  total: number;

  @IsNumber()
  jobsCount: number;

  @IsNumber()
  count: number;

  @IsNumber()
  price: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  paytraqId?: string;
}

export class Invoice {
  @Type(() => ObjectId)
  _id: ObjectId;

  @IsString()
  invoiceId: string;

  @IsString()
  customer: string;

  @Type(() => Date)
  @IsDate()
  createdDate: Date;

  @Type(() => Number)
  @IsInt({ each: true })
  jobsId: number[];

  @Type(() => InvoiceProduct)
  @ValidateNested({ each: true })
  products: InvoiceProduct[];

  @IsOptional()
  comment?: string;

  @Type(() => PaytraqInvoice)
  @IsOptional()
  paytraq?: PaytraqInvoice;
}

export type InvoiceResponse = Invoice & {
  customerInfo?: Customer;
  total?: number;
};

export interface InvoicesFilter {
  customer?: string;
}

export interface ProductTotals {
  _id: string;
  count: number;
  total: number;
}

export const INVOICE_SCHEMA: { [key: string]: any } = {
  bsonType: 'object',
  required: ['invoiceId', 'customer'],
  properties: {
    invoiceId: {
      bsonType: 'string',
    },
    customer: {
      bsonType: 'string',
    },
    createdDate: {
      bsonType: 'date',
    },
    jobsId: {
      bsonType: 'array',
      items: {
        bsonType: 'number',
      },
    },
  },
};
