import { Inject, Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';
import { KastesJob } from '../entities/job.entity';
import { JOBS_COLLECTION } from './jobs-collection.provider';

@Injectable()
export class KastesJobsDao {
  constructor(
    @Inject(JOBS_COLLECTION) private readonly collection: Collection<KastesJob>,
  ) {}

  async getKastesJobs(veikali = false) {
    const pipeline = [
      { $match: { category: 'perforated paper' } },
      {
        $lookup: {
          from: 'kastes-kastes',
          localField: 'jobId',
          foreignField: 'pasutijums',
          as: 'kastes-kastes',
        },
      },
      {
        $addFields: { veikaliCount: { $size: '$kastes-kastes' } },
      },
      {
        $match: {
          veikaliCount: veikali ? { $gt: 0 } : { $eq: 0 },
        },
      },
      {
        $project: {
          _id: 0,
          jobId: 1,
          name: 1,
          receivedDate: 1,
          dueDate: 1,
          veikaliCount: 1,
        },
      },
    ];

    return this.collection.aggregate(pipeline).toArray();
  }
}
