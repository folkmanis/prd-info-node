import { MongoClient, Collection, ObjectId, FilterQuery } from "mongodb";
import Logger from '../lib/logger';
import { Job, JobResponse, JobQueryFilter, JOBS_SCHEMA } from '../lib/job.class';

let jobs: Collection<Job>;
const JOBS_COLLECTION_NAME = 'jobs';

export class jobsDAO {
    static async injectDB(conn: MongoClient): Promise<void> {
        if (jobs) { return; }
        try {
            jobs = conn.db(process.env.DB_BASE as string)
                .collection(JOBS_COLLECTION_NAME);
        } catch (err) {
            Logger.error('Customers DAO', err);
        }
        if ((await jobs.estimatedDocumentCount()) === 0) {
            await this.createCollection(conn);
        }
        jobsDAO.createIndexes();
    }

    static async getJobs(query: JobQueryFilter): Promise<JobResponse> {
        const filter: FilterQuery<Job> = {};
        if (query.fromDate) {
            filter.receivedDate = { $gte: new Date(query.fromDate) };
        }
        if (query.customer) {
            filter.customer = query.customer;
        }
        if (query.name) {
            filter.name = { $regex: query.name, $options: 'i' };
        }
        const result = jobs.find(filter, {
            projection: {
                jobId: 1,
                customer: 1,
                name: 1,
                customerJobId: 1,
                receivedDate: 1,
                'invoice.number': 1,
            },
            sort: {
                jobId: 1,
            }
        });

        return {
            jobs: await result.toArray(),
            error: null,
        };
    }

    static async getJob(jobId: number): Promise<JobResponse> {
        const resp = await jobs.findOne({jobId});
        return {
            job: resp || undefined,
            error: null,
        }
    }

    static async insertJob(job: Job): Promise<JobResponse> {
        const result = await jobs.insertOne(job);
        return {
            result: result.result,
            error: !result.result.ok,
            insertedId: result.insertedId,
            job: result.ops.pop(),
        };
    }

    static async updateJob(jobId: number, job: Partial<Job>): Promise<JobResponse> {
        job = jobsDAO.validateJob(job);
        const result = await jobs.updateOne({ jobId }, { $set: job });
        return {
            error: !result.result.ok,
            result: result.result,
            modifiedCount: result.modifiedCount,
        };
    }

    static createIndexes(): void {
        jobs.createIndexes([
            {
                key: { jobId: 1 },
                unique: true,
            },
            {
                key: { customer: 1, },
            },
            {
                key: { receivedDate: -1 },
            }
        ]);
    }

    static async createCollection(conn: MongoClient): Promise<void> {
        // await conn.db(process.env.DB_BASE as string).dropCollection(JOBS_COLLECTION_NAME);
        await conn.db(process.env.DB_BASE as string)
            .createCollection(JOBS_COLLECTION_NAME, {
                validator: {
                    $jsonSchema: JOBS_SCHEMA,
                }
            });
    }

    static validateJob<T extends Partial<Job>>(job: T): T {
        if (typeof job.receivedDate === 'string') {
            job.receivedDate = new Date(job.receivedDate);
        }
        return job;
    }

}
