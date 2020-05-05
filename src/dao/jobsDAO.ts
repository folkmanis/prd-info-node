import { MongoClient, Collection, ObjectId, FilterQuery, UpdateQuery } from "mongodb";
import Logger from '../lib/logger';
import { Job, JobResponse, JobQueryFilter, JOBS_SCHEMA } from '../lib/job.class';
import { Invoice, InvoiceProduct } from '../lib/invoice.class';

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
        await this.createCollection(conn);
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
        if (query.invoice !== undefined) {
            filter.invoiceId = {
                $exists: Boolean(+query.invoice),
            };
        }
        if (query.name) {
            filter.name = { $regex: query.name, $options: 'i' };
        }
        const aggr: object[] = [
            {
                $match: filter
            },
            {
                $project: {
                    _id: 0,
                    jobId: 1,
                    customer: 1,
                    name: 1,
                    customerJobId: 1,
                    receivedDate: 1,
                    products: 1,
                    invoiceId: 1,
                }
            },
            {
                $sort: {
                    jobId: -1,
                }
            }
        ];
        if (query.unwindProducts) {
            aggr.push({
                '$unwind': {
                    'path': '$products',
                    'includeArrayIndex': 'productsIdx',
                    'preserveNullAndEmptyArrays': false
                }
            });
        }
        const result = jobs.aggregate(aggr);

        return {
            jobs: await result.toArray(),
            error: null,
        };
    }

    static async getJob(jobId: number): Promise<JobResponse> {
        const resp = await jobs.findOne({ jobId });
        return {
            job: resp || undefined,
            error: null,
        };
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
        const result = await jobs.updateOne(
            {
                jobId,
                invoiceId: { $exists: false }
            },
            { $set: job }
        );
        return {
            error: !result.result.ok,
            result: result.result,
            modifiedCount: result.modifiedCount,
        };
    }
    /**
     * Uzliek darbiem aprēķina numurus. 
     * Atgriež sarakstu ar darbiem, kuriem ir invoiceId numurs
     * (var atšķirties no sākotnējā)
     * @param jobIds Darbu numuri
     * @param invoiceId Aprēķina numurs
     */
    static async setInvoice(
        jobIds: number[],
        customerId: string,
        invoiceId: string
    ): Promise<number[]> {
        const filter: FilterQuery<Job> = {
            jobId: { $in: jobIds },
            invoiceId: { $exists: false },
            customer: customerId,
        };
        const update: UpdateQuery<Job> = {
            $set: { invoiceId },
        };
        return jobs
            .updateMany(filter, update)
            .then(() => {
                return jobs.find(
                    { invoiceId },
                    {
                        projection: { jobId: 1, _id: 0 },
                        sort: { jobId: 1 },
                    }
                )
                    .map(job => job.jobId)
                    .toArray();
            });
    }

    static async getInvoiceTotals(invoiceId: string): Promise<InvoiceProduct[]> {
        const aggr = [
            {
                $match: { 'invoiceId': invoiceId, }
            }, {
                $unwind: { 'path': '$products', }
            }, {
                $addFields: {
                    'products.total': {
                        '$multiply': ['$products.price', '$products.count']
                    }
                }
            }, {
                $group: {
                    '_id': '$products.name',
                    'total': { '$sum': '$products.total' },
                    'jobsCount': { '$sum': 1 },
                    'count': { '$sum': '$products.count' }
                }
            }
        ];
        return jobs.aggregate<InvoiceProduct>(aggr).toArray();
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
            },
            {
                key: { invoiceId: 1 },
            }
        ]);
    }

    static async createCollection(conn: MongoClient): Promise<void> {
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
