import { ObjectId } from 'mongodb';
import { Job } from './job.class';
import { Product } from './products-interface';
import { ResponseBase } from '../lib/response-base.interface';

export interface Invoice {
    invoiceId: string;
    customer: string;
    createdDate: Date;
    jobsId: number[];
    products: InvoiceProduct[];
}

export interface InvoicesFilter {
    customer?: string;
}

export interface InvoiceProduct {
    _id: string;
    total: number;
    jobsCount: number;
    count: number;
    price: number;
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
