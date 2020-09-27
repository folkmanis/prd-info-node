import { ObjectId } from 'mongodb';
import { Product } from './products.interface';
import { ResponseBase } from './response-base.interface';

export type JobProduct = Pick<Product, 'name'> & {
    price: number;
    count: number;
    comment: string;
};

export interface Job {
    _id: ObjectId;
    jobId: number;
    customer: string;
    name: string;
    customerJobId?: string;
    receivedDate: Date;
    dueDate: Date;
    comment?: string,
    invoiceId?: string;
    products?: JobProduct[] | JobProduct;
    productsIdx?: number;
    jobStatus: {
        generalStatus: number;
    };
    custCode: string;
    files?: {
        path?: string[];
    };
}

export interface JobsWithoutInvoicesTotals {
    _id: string;
    jobs: number;
    totals: number;
}

export interface JobResponse extends ResponseBase {
    insertedIds?: { [key: number]: ObjectId; };
    jobsWithoutInvoicesTotals?: JobsWithoutInvoicesTotals[];
}

export interface JobQueryFilter {
    fromDate?: Date;
    customer?: string;
    name?: string;
    invoice?: boolean;
    jobsId?: string;
    unwindProducts?: 0 | 1;
    jobStatus?: string,
};

export type JobUpdate = Pick<Job, 'jobId'> & Partial<Job>;

export const JOBS_SCHEMA: { [key: string]: any; } = {
    bsonType: 'object',
    required: ['jobId', 'customer', 'receivedDate', 'name', 'jobStatus'],
    properties: {
        jobId: {
            bsonType: 'number',
        },
        receivedDate: {
            bsonType: 'date',
        },
        customer: {
            bsonType: 'string',
        },
        name: {
            bsonType: 'string',
        },
        invoiceId: {
            bsonType: 'string',
        },
        jobStatus: {
            bsonType: 'object',
            properties: {
                generalStatus: {
                    bsonType: 'int',
                }
            }
        }
    }
};
