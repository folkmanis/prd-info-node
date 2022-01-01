import { Inject, Injectable } from '@nestjs/common';
import { Collection, Filter, UpdateFilter } from 'mongodb';
import { InvoiceProduct, ProductTotals } from '../../invoices/entities/invoice.entity';
import { JobsWithoutInvoicesTotals } from '../dto/jobs-without-invoices-totals.interface';
import { Job } from '../entities/job.entity';
import { JOBS_COLLECTION } from './jobs-collection.provider';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface';

@Injectable()
export class JobsProductsDaoService {

    constructor(
        @Inject(JOBS_COLLECTION) private readonly collection: Collection<Job>,
    ) { }

    async getProductsTotals({ start, limit, filter }: FilterType<Job>, category: string[] | undefined) {
        const pipeline: Record<string, any>[] = [
            {
                $match: filter
            },
            {
                $unwind: { path: '$products' }
            },
            {
                $group: {
                    _id: '$products.name',
                    sum: { $sum: '$products.count' },
                    count: { $sum: 1 },
                    total: {
                        $sum: {
                            $multiply: ['$products.count', '$products.price']
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'name',
                    as: 'productInfo'
                }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            { $arrayElemAt: ['$productInfo', 0] },
                            { sum: '$sum' },
                            { count: '$count' },
                            { total: '$total' },
                        ]
                    }
                }
            }
        ];
        if (category) {
            pipeline.push(
                {
                    $match: {
                        category: { $in: category },
                    }
                }
            );
        }
        pipeline.push(
            {
                $project: {
                    prices: 0,
                    paytraqId: 0,
                    productionStages: 0,
                }
            },
            {
                $sort: {
                    category: 1,
                    sum: -1,
                }
            },
        );
        if (start > 0) {
            pipeline.push(
                { $skip: start }
            );
        }
        pipeline.push(
            { $limit: limit }
        );

        return this.collection.aggregate(pipeline).toArray();
    }

}