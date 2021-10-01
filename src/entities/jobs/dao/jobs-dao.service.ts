import { Inject, Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';
import { isUndefined, pickBy } from 'lodash';
import { BulkWriteUpdateOneOperation, Collection, UpdateQuery } from 'mongodb';
import { JobFilter, JobQuery } from '../dto/job-query';
import { UpdateJobDto } from '../dto/update-job.dto';
import { JobProduct } from '../entities/job-product.entity';
import { Job } from '../entities/job.entity';
import { JOBS_COLLECTION } from './jobs-collection.provider';




@Injectable()
export class JobsDao {


    constructor(
        @Inject(JOBS_COLLECTION) private readonly collection: Collection<Job>,
    ) { }

    async getAll(query: JobQuery) {

        const { start, limit, unwindProducts, ...filter } = query;

        const aggr: any[] = [
            {
                $match: pickBy(classToPlain(plainToClass(JobFilter, filter)), value => !isUndefined(value)),
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
        aggr.push({
            $limit: limit,
        });

        if (start > 0) {
            aggr.push({
                $skip: start,
            });
        }
        return this.collection.aggregate(aggr).toArray();

    }


    async getOne(jobId: number): Promise<Job | null> {
        return this.collection.findOne({ jobId });
    }

    async insertOne(job: Job): Promise<Job | undefined> {
        const { value } = await this.collection.findOneAndReplace(
            { jobId: job.jobId },
            job,
            { upsert: true, returnDocument: 'after' }
        );
        return value;
    }

    async insertJobs(insertJobs: Job[]): Promise<string[]> {
        const { insertedIds } = await this.collection.insertMany(
            insertJobs,
        );
        return Object.values(insertedIds).map(id => id.toHexString());
    }

    async updateJob({ jobId, ...job }: UpdateJobDto): Promise<Job | undefined> {
        const { value } = await this.collection.findOneAndUpdate(
            {
                jobId,
                invoiceId: { $exists: false },
            },
            { $set: job },
            { returnDocument: 'after' }
        );
        return value;
    }

    async updateJobs(jobsUpdate: UpdateJobDto[]): Promise<number> {
        const operations: BulkWriteUpdateOneOperation<Job>[] =
            jobsUpdate.map(jobUpdate);

        const { modifiedCount } = await this.collection.bulkWrite(operations);
        return modifiedCount || 0;
    }

    async updateJobProduct(jobId: number, idx: number, jobProduct: JobProduct) {
        const update = (Object.keys(JobProduct) as Array<keyof JobProduct>)
            .map(key => ({ [`products.${idx}.${key}`]: jobProduct[key] }));

        const { modifiedCount } = await this.collection.updateOne(
            { jobId },
            Object.assign({}, ...update)
        );

        return modifiedCount;

    }


}


function jobUpdate({ jobId, ...job }: UpdateJobDto): BulkWriteUpdateOneOperation<Job> {

    const update: UpdateQuery<Job> = {
        $set: { ...job },
    };

    return {
        updateOne:
        {
            filter: { jobId },
            update,
            upsert: false,
        },
    };
}

