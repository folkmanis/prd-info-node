import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { MongoClient, Collection, ObjectId, FilterQuery, UpdateQuery, BulkWriteUpdateOneOperation, BulkWriteUpdateOperation, Db, } from 'mongodb';

import { JOBS_COLLECTION } from './jobs-collection.provider';

import { JobQuery, JobFilter } from '../dto/job-query';
import { Job } from '../entities/job.entity';
import { JobProduct } from '../entities/job-product.entity';

import { CreateJobDto } from '../dto/create-job.dto';
import { UpdateJobDto } from '../dto/update-job.dto';
import { Type, deserializeArray, Transform, classToPlain, Expose, plainToClass } from 'class-transformer';
import { isUndefined, pickBy } from 'lodash';

@Injectable()
export class JobsDao {


    constructor(
        @Inject(JOBS_COLLECTION) private readonly collection: Collection<Job>,
    ) { }

    async getAll(query: JobQuery) {

        const { start, limit, unwindProducts, ...filter } = query;
        console.log(classToPlain(plainToClass(JobFilter, filter)));

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
                    category: 1,
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
        // return aggr;
        return this.collection.aggregate(aggr).toArray();

    }


    async getOne(jobId: number): Promise<Job> {
        const job = await this.collection.findOne({ jobId });
        if (!job) {
            throw new NotFoundException(`Job ${jobId} not found`);
        }
        return job;
    }

    async insertOne({ jobId, ...job }: Job): Promise<Job> {
        const { value } = await this.collection.findOneAndReplace(
            { jobId },
            job,
            { upsert: true, returnDocument: 'after' }
        );
        if (!value) {
            throw new Error(`Job insert failed`);
        }
        return value;
    }

    async insertJobs(insertJobs: Job[]): Promise<string[]> {
        const { insertedIds } = await this.collection.insertMany(
            insertJobs,
        );
        return Object.values(insertedIds).map(id => id.toHexString());
    }

    async updateJob({ jobId, ...job }: UpdateJobDto): Promise<Job> {
        const { value } = await this.collection.findOneAndUpdate(
            {
                jobId,
                invoiceId: { $exists: false },
            },
            { $set: job },
            { returnDocument: 'after' }
        );
        if (!value) {
            throw new Error(`Job update failed`);

        }
        return value;
    }

    async updateJobs(jobsUpdate: UpdateJobDto[]): Promise<number> {
        const operations: BulkWriteUpdateOneOperation<Job>[] =
            jobsUpdate.map(job => this.jobUpdate(job));

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

    private jobUpdate({ jobId, ...job }: UpdateJobDto): BulkWriteUpdateOneOperation<Job> {

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


}
