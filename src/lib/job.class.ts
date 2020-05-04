import { ObjectId } from 'mongodb';
import { Product } from '../lib/products-interface';
import { ResponseBase } from '../lib/response-base.interface';

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
    comment?: string,
    invoiceId?: string;
    products?: JobProduct[];
}

export interface JobResponse extends ResponseBase {
    jobs?: Job[];
    job?: Job;
}

export interface JobQueryFilter {
    fromDate?: Date;
    customer?: string;
    name?: string;
    invoice?: boolean;
};

export type JobUpdate = Pick<Job, 'jobId'> & Partial<Job>;

export const JOBS_SCHEMA: { [key: string]: any; } = {
    bsonType: 'object',
    required: ['jobId', 'customer', 'receivedDate', 'name'],
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
    }
};
