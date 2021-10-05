import {
  MongoClient,
  Collection,
  ObjectId,
  FilterQuery,
  UpdateQuery,
  BulkWriteUpdateOneOperation,
  BulkWriteUpdateOperation,
  Db,
} from 'mongodb';
import Logger from '../lib/logger';
import {
  Job,
} from '../interfaces';
import { Dao } from '../interfaces/dao.interface';

export class JobsProductionDao {
  collection!: Collection<Job>;

  async activeProduction({
    productionStatus,
  }: { productionStatus?: number[]; } = {}) {
    let pipeline = [];
    if (productionStatus) {
      pipeline.push({
        $match: {
          'productionStages.productionStatus': {
            $in: productionStatus,
          },
        },
      });
    }
    pipeline = [
      ...pipeline,
      {
        $unwind: {
          path: '$productionStages',
          includeArrayIndex: 'idx',
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                jobId: '$jobId',
                jobName: '$name',
                idx: '$idx',
              },
              '$productionStages',
            ],
          },
        },
      },
    ];
    return this.collection.aggregate(pipeline).toArray();
  }
}
