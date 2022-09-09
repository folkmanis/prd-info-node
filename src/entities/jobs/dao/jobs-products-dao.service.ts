import { Inject, Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';

import { Job } from '../entities/job.entity';
import { JOBS_COLLECTION } from './jobs-collection.provider';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface';
import { SortOrder } from '../dto/products-query';

interface ProductsTotalsOptions {
  category?: string[];
  sort?: SortOrder;
}

@Injectable()
export class JobsProductsDaoService {
  constructor(
    @Inject(JOBS_COLLECTION) private readonly collection: Collection<Job>,
  ) { }

  async getProductsTotals(
    { start, limit, filter }: FilterType<Job>,
    options: ProductsTotalsOptions = {},
  ) {
    const pipeline: Record<string, any>[] = [
      {
        $match: filter,
      },
      {
        $unwind: { path: '$products' },
      },
      {
        $group: {
          _id: '$products.name',
          sum: { $sum: '$products.count' },
          count: { $sum: 1 },
          total: {
            $sum: {
              $multiply: ['$products.count', '$products.price'],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'name',
          as: 'productInfo',
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              { $arrayElemAt: ['$productInfo', 0] },
              { sum: '$sum' },
              { count: '$count' },
              { total: '$total' },
            ],
          },
        },
      },
    ];
    if (options.category) {
      pipeline.push({
        $match: {
          category: { $in: options.category },
        },
      });
    }
    pipeline.push({
      $project: {
        prices: 0,
        paytraqId: 0,
        productionStages: 0,
      },
    });

    let $sort: Record<string, 1 | -1> = { name: 1 };
    if (options.sort) {
      $sort = {
        [options.sort.column]: options.sort.direction,
        name: options.sort.column === 'name' ? options.sort.direction : 1,
      };
    }
    pipeline.push({ $sort });

    if (start > 0) {
      pipeline.push({ $skip: start });
    }
    pipeline.push({ $limit: limit });


    return this.collection.aggregate(pipeline).toArray();

  }
}
