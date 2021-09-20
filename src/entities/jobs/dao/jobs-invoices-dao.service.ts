import { Inject, Injectable } from '@nestjs/common';
import { Collection, FilterQuery, UpdateQuery } from 'mongodb';
import { InvoiceProduct, ProductTotals } from '../../invoices/entities/invoice.entity';
import { JobsWithoutInvoicesTotals } from '../dto/jobs-without-invoices-totals.interface';
import { Job } from '../entities/job.entity';
import { JOBS_COLLECTION } from './jobs-collection.provider';


@Injectable()
export class JobsInvoicesDao {

    constructor(
        @Inject(JOBS_COLLECTION) private readonly collection: Collection<Job>,
    ) { }


    async setInvoice(jobIds: number[], invoiceId: string,): Promise<number[]> {
        const filter: FilterQuery<Job> = {
            jobId: { $in: jobIds },
            invoiceId: { $exists: false },
        };
        const update: UpdateQuery<Job> = {
            $set: {
                invoiceId,
                jobStatus: {
                    generalStatus: 50,
                },
            },
        };
        await this.collection.updateMany(filter, update);
        return this.collection
            .find(
                { invoiceId },
                {
                    projection: { jobId: 1, _id: 0 },
                    sort: { jobId: 1 },
                },
            )
            .map(job => job.jobId)
            .toArray();
    }

    async unsetInvoices(invoiceId: string): Promise<number> {
        const { modifiedCount } = await this.collection.updateMany(
            { invoiceId },
            {
                $unset: { invoiceId: '' },
                $set: { 'jobStatus.generalStatus': 40 },
            },
        );
        return modifiedCount;
    }

    async getInvoiceTotals(invoiceId: string): Promise<InvoiceProduct[]> {
        const aggr = [
            {
                $match: { invoiceId: invoiceId },
            },
            {
                $unwind: { path: '$products' },
            },
            {
                $addFields: {
                    'products.total': {
                        $multiply: ['$products.price', '$products.count'],
                    },
                },
            },
            {
                $group: {
                    _id: '$products.name',
                    total: { $sum: '$products.total' },
                    jobsCount: { $sum: 1 },
                    count: { $sum: '$products.count' },
                },
            },
            {
                $addFields: {
                    price: { $divide: ['$total', '$count'] },
                },
            },
        ];
        return this.collection.aggregate<InvoiceProduct>(aggr).toArray();
    }

    async jobsWithoutInvoiceTotals(): Promise<JobsWithoutInvoicesTotals[]> {
        const pipeline = [
            {
                $match: {
                    invoiceId: {
                        $exists: false,
                    },
                    'jobStatus.generalStatus': {
                        $lt: 50,
                    },
                },
            },
            {
                $addFields: {
                    totals: {
                        $reduce: {
                            input: '$products',
                            initialValue: 0,
                            in: {
                                $add: [
                                    '$$value',
                                    { $multiply: ['$$this.count', '$$this.price'] },
                                ],
                            },
                        },
                    },
                    noPrice: {
                        $cond: {
                            if: { $isArray: '$products' },
                            then: {
                                $size: {
                                    $filter: {
                                        input: '$products',
                                        cond: {
                                            $or: [
                                                {
                                                    $eq: ['$$this.price', 0],
                                                },
                                                {
                                                    $eq: ['$$this.price', null],
                                                },
                                                {
                                                    $eq: [
                                                        {
                                                            $type: '$$this.price',
                                                        },
                                                        'missing',
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                },
                            },
                            else: 0,
                        },
                    },
                },
            },
            {
                $group: {
                    _id: '$customer',
                    jobs: {
                        $sum: 1,
                    },
                    totals: {
                        $sum: '$totals',
                    },
                    noPrice: {
                        $sum: '$noPrice',
                    },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ];
        return this.collection
            .aggregate<JobsWithoutInvoicesTotals>(pipeline)
            .toArray();
    }

    async getJobsTotals(jobIds: number[]): Promise<ProductTotals[]> {
        const aggr = [
            {
                $match: { jobId: { $in: jobIds } },
            },
            {
                $unwind: { path: '$products' },
            },
            {
                $addFields: {
                    'products.total': {
                        $multiply: ['$products.price', '$products.count'],
                    },
                },
            },
            {
                $group: {
                    _id: '$products.name',
                    count: { $sum: '$products.count' },
                    total: { $sum: '$products.total' },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ];
        return this.collection.aggregate<ProductTotals>(aggr).toArray();
    }


}