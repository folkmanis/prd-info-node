import { Inject, Injectable } from '@nestjs/common';
import { Collection, Document } from 'mongodb';
import { JOBS_COLLECTION } from './jobs-collection.provider.js';
import { Job } from '../entities/job.entity.js';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface.js';

@Injectable()
export class JobsMaterialsDaoService {
  constructor(
    @Inject(JOBS_COLLECTION) private readonly collection: Collection<Job>,
  ) {}

  async getMaterialsTotals({ start, limit, filter }: FilterType<Job>) {
    const pipeline: Document[] = [
      {
        $unwind: {
          path: '$productionStages',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $unwind: {
          path: '$productionStages.materials',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: '$productionStages.materials.materialId',
          total: {
            $sum: '$productionStages.materials.amount',
          },
          count: {
            $sum: 1,
          },
          totalCost: {
            $sum: '$productionStages.materials.cost',
          },
          customers: {
            $addToSet: '$customer',
          },
        },
      },
      {
        $lookup: {
          from: 'materials',
          localField: '_id',
          foreignField: '_id',
          as: 'descriptions',
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                $arrayElemAt: ['$descriptions', 0],
              },
              '$$ROOT',
            ],
          },
        },
      },
      {
        $project: {
          descriptions: 0,
          prices: 0,
          fixedPrice: 0,
          inactive: 0,
        },
      },
      {
        $sort: {
          name: 1,
        },
      },
    ];

    if (Object.keys(filter).length > 0) {
      pipeline.unshift({
        $match: filter,
      });
    }
    if (start > 0) {
      pipeline.push({
        $skip: start,
      });
    }
    pipeline.push({
      $limit: limit,
    });

    return this.collection.aggregate(pipeline).toArray();
  }
}
