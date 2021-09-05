import { ObjectId } from 'mongodb';
import { Product } from './products.interface';
import { ResponseBase } from './response-base.interface';
import { JobBase, JobCategories } from './job-base.interface';
import { KastesJob } from './kastes-order.interface';

export type ReproJob = JobBase & {
  category: 'repro';
};

export type Job = ReproJob | KastesJob;

export interface JobsWithoutInvoicesTotals {
  _id: string;
  jobs: number;
  totals: number;
}

export interface JobResponse extends ResponseBase<Job> {
  insertedIds?: { [key: number]: ObjectId };
  jobsWithoutInvoicesTotals?: JobsWithoutInvoicesTotals[];
}

export interface JobQueryFilter {
  fromDate?: Date;
  customer?: string;
  name?: string;
  invoice?: boolean;
  jobsId?: string;
  unwindProducts?: 0 | 1;
  jobStatus?: string;
  category?: JobCategories;
}

export type JobUpdate = Pick<Job, 'jobId'> & Partial<Job>;

export const JOBS_SCHEMA: { [key: string]: any } = {
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
        },
      },
    },
  },
};
