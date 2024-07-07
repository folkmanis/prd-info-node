import { Inject, Injectable } from '@nestjs/common';
import { AnyBulkWriteOperation, Collection, UpdateFilter } from 'mongodb';
import { FilterType } from '../../../lib/start-limit-filter/filter-type.interface.js';
import { UpdateJobDto } from '../dto/update-job.dto.js';
import { JobProduct } from '../entities/job-product.entity.js';
import { Job } from '../entities/job.entity.js';
import { JOBS_COLLECTION } from './jobs-collection.provider.js';

@Injectable()
export class JobsDao {
  constructor(
    @Inject(JOBS_COLLECTION) private readonly collection: Collection<Job>,
  ) { }

  async getAll(
    query: FilterType<Job>,
    unwindProducts: boolean,
  ): Promise<Job[]> {
    const aggr = findAllPipeline(query, unwindProducts);

    return this.collection.aggregate(aggr).toArray() as Promise<Job[]>;
  }

  async getCount({ filter }: FilterType<Job>): Promise<number> {
    return this.collection.countDocuments(filter);
  }

  async getOne(jobId: number): Promise<Job | null> {
    return this.collection.findOne({ jobId });
  }

  async insertOne(job: Job): Promise<Job | null> {
    return this.collection.findOneAndReplace({ jobId: job.jobId }, job, {
      upsert: true,
      returnDocument: 'after',
    });
  }

  async insertJobs(insertJobs: Job[]): Promise<string[]> {
    const { insertedIds } = await this.collection.insertMany(insertJobs);
    return Object.values(insertedIds).map((id) => id.toHexString());
  }

  async updateJob({ jobId, ...job }: UpdateJobDto): Promise<Job | null> {
    return this.collection.findOneAndUpdate(
      {
        jobId,
        invoiceId: { $exists: false },
      },
      { $set: job },
      { returnDocument: 'after' },
    );
  }

  async updateJobs(jobsUpdate: UpdateJobDto[]): Promise<number> {
    const operations: AnyBulkWriteOperation<Job>[] = jobsUpdate.map(jobUpdate);

    const { modifiedCount } = await this.collection.bulkWrite(operations);
    return modifiedCount || 0;
  }

  async updateJobProduct(jobId: number, idx: number, jobProduct: JobProduct) {
    const update = (Object.keys(JobProduct) as Array<keyof JobProduct>).map(
      (key) => ({ [`products.${idx}.${key}`]: jobProduct[key] }),
    );

    const { modifiedCount } = await this.collection.updateOne(
      { jobId },
      Object.assign({}, ...update),
    );

    return modifiedCount;
  }
}

function jobUpdate({
  jobId,
  ...job
}: UpdateJobDto): AnyBulkWriteOperation<Job> {
  const update: UpdateFilter<Job> = {
    $set: { ...job },
  };

  return {
    updateOne: {
      filter: { jobId },
      update,
      upsert: false,
    },
  };
}

function findAllPipeline(
  query: FilterType<Job>,
  unwindProducts: boolean,
): any[] {
  const { start, limit, filter } = query;

  const aggr: any[] = [
    {
      $match: filter,
    },
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: 'CustomerName',
        as: 'custCode',
      },
    },
    {
      $project: {
        _id: 0,
        jobId: 1,
        customer: 1,
        name: 1,
        customerJobId: 1,
        receivedDate: 1,
        dueDate: 1,
        products: 1,
        invoiceId: 1,
        jobStatus: 1,
        'production.category': 1,
        custCode: { $arrayElemAt: ['$custCode.code', 0] },
      },
    },
    {
      $sort: {
        jobId: -1,
      },
    },
  ];
  if (unwindProducts) {
    aggr.push({
      $unwind: {
        path: '$products',
        includeArrayIndex: 'productsIdx',
        preserveNullAndEmptyArrays: true,
      },
    });
  }
  if (start > 0) {
    aggr.push({
      $skip: start,
    });
  }
  aggr.push({
    $limit: limit,
  });

  return aggr;
}
