import { ObjectId } from 'mongodb';
import { Customer } from './customers.interface';
import { Job } from './job.interface';
import { Product } from './products.interface';
import { ResponseBase } from './response-base.interface';

export interface Invoice {
    invoiceId: string;
    customer: string;
    customerInfo?: Customer;
    createdDate: Date;
    jobsId: number[];
    products: InvoiceProduct[];
    comment?: string;
    paytraq?: PaytraqInvoice;
}

export interface PaytraqInvoice {
    paytraqId: number;
    documentRef?: string;
}

export const INVOICE_UPDATE_FIELDS = ['comment', 'paytraq'] as const;

export type InvoiceUpdate = Partial<Pick<Invoice, typeof INVOICE_UPDATE_FIELDS[number]>>

export interface InvoicesFilter {
    customer?: string;
}

export interface InvoiceProduct {
    _id: string;
    total: number;
    jobsCount: number;
    count: number;
    price: number;
    comment?: string;
    paytraqId?: string;
};

export interface InvoiceResponse extends ResponseBase<Invoice> {
    totals?: ProductTotals[];
}

export interface ProductTotals {
    _id: string;
    count: number;
    total: number;
}

export const INVOICE_SCHEMA: { [key: string]: any; } = {
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
            }
        },
    }
};
