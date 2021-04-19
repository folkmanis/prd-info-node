import { MongoClient, Collection, ObjectId, FilterQuery, UpdateQuery, BulkWriteUpdateOneOperation, BulkWriteUpdateOperation } from "mongodb";
import Logger from '../lib/logger';
import { fileSystemDAO } from './fileSystemDAO';
import {
    Job,
    JobResponse,
    JobCategories,
    JobQueryFilter,
    JOBS_SCHEMA,
    InvoiceProduct,
    InvoiceResponse,
    ProductTotals,
    JobsWithoutInvoicesTotals,
    KastesJob, KastesJobPartial, KastesJobResponse, JobProduct
} from '../interfaces';

let jobs: Collection<Job>;
const JOBS_COLLECTION_NAME = 'jobs';
const DEFAULT_UNIT = 'gab.';

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
        await this.upgradeDb();
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
        if (query.jobsId) {
            filter.jobId = { $in: query.jobsId.split(',').map(id => +id) };
        }
        if (query.jobStatus) {
            filter['jobStatus.generalStatus'] = {
                $in: query.jobStatus.split(',').map(st => +st),
            };
        }
        if (typeof query.category === 'string') {
            filter.category = query.category;
        }
        const aggr: object[] = [
            {
                $match: filter
            }, {
                $lookup: {
                    from: 'customers',
                    localField: 'customer',
                    foreignField: 'CustomerName',
                    as: 'custCode'
                }
            }, {
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
                    custCode: { $arrayElemAt: ["$custCode.code", 0] }
                }
            },
            {
                $sort: {
                    jobId: -1,
                }
            }
        ];
        if (query.unwindProducts && +query.unwindProducts === 1) {
            aggr.push({
                '$unwind': {
                    'path': '$products',
                    'includeArrayIndex': 'productsIdx',
                    'preserveNullAndEmptyArrays': true,
                }
            });
        }
        const result = jobs.aggregate(aggr);

        return {
            data: await result.toArray(),
            error: null,
        };
    }

    static async getKastesJobs(veikali: boolean = false): Promise<KastesJobResponse> {
        const pipeline = [
            { $match: { 'category': 'perforated paper' } },
            {
                $lookup: {
                    'from': 'kastes-kastes',
                    'localField': 'jobId',
                    'foreignField': 'pasutijums',
                    'as': 'kastes-kastes'
                }
            },
            {
                $addFields: { 'veikaliCount': { '$size': '$kastes-kastes' } }
            },
            {
                $match: {
                    'veikaliCount': veikali ? { $gt: 0 } : { $eq: 0 }
                }
            },
            {
                $project: {
                    '_id': 0,
                    'jobId': 1,
                    'name': 1,
                    'receivedDate': 1,
                    'dueDate': 1,
                    'veikaliCount': 1,
                }
            }
        ];
        try {
            const result = await jobs.aggregate<KastesJobPartial>(pipeline).toArray();
            return {
                error: false,
                data: result,
            };
        } catch (error) { return { error }; }
    }

    static async getJob(jobId: number): Promise<Job | null> {
        return jobs.findOne({ jobId });
    }

    static async insertJob(job: Job): Promise<Job> {
        job = jobsDAO.validateJob(job);
        if (!job.jobStatus) {
            job.jobStatus = { generalStatus: 10 };
        }
        Logger.info('insert job', job);
        const result = jobs.insertOne(job)
            .then(result => jobs.findOne(
                { _id: result.insertedId },
            ))
            .then(newJob => {
                if (!newJob) { throw 'Job insert failed'; }
                return newJob;
            });
        return result;
    }

    static async insertJobs(insertJobs: Job[]): Promise<JobResponse> {
        Logger.info('insert jobs many', insertJobs);
        if (!(insertJobs && insertJobs.length > 0)) { return { error: null, insertedCount: 0 }; }
        insertJobs.forEach(job => job = jobsDAO.validateJob(job));
        try {
            const { insertedCount, insertedIds } = await jobs.insertMany(insertJobs);
            return {
                error: false,
                insertedCount,
                insertedIds,
            };
        } catch (error) { return { error }; }
    }

    static async updateJob(jobId: number, job: Partial<Job>): Promise<number> {
        job = jobsDAO.validateJob(job);
        if (job.files?.path) {
            try {
                await fileSystemDAO.createFolder(job.files.path);
            } catch (error) {
                job.files = undefined;
            }
        }
        const result = await jobs.updateOne(
            {
                jobId,
                invoiceId: { $exists: false }
            },
            { $set: job }
        );
        return result.modifiedCount;

    }

    static async updateJobs(jobsUpdate: Partial<Job>[]): Promise<number> {
        const operations: BulkWriteUpdateOneOperation<Job>[] = jobsUpdate.map(job => ({
            updateOne: this.jobUpdate(job),
        }));
        const resp = await jobs.bulkWrite(operations);
        return resp.modifiedCount || 0;
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
            $set: {
                invoiceId,
                jobStatus: {
                    generalStatus: 50,
                },
            },
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
                    'products.total': { $multiply: ['$products.price', '$products.count'] },
                }
            }, {
                $group: {
                    '_id': '$products.name',
                    'total': { '$sum': '$products.total' },
                    'jobsCount': { '$sum': 1 },
                    'count': { '$sum': '$products.count' }
                }
            }, {
                '$addFields': {
                    'price': { '$divide': ['$total', '$count'] }
                }
            }
        ];
        return jobs.aggregate<InvoiceProduct>(aggr).toArray();
    }

    static async jobsWithoutInvoiceTotals(): Promise<JobResponse> {
        const pipeline = [
            {
                '$match': {
                    'invoiceId': {
                        '$exists': false
                    },
                    'jobStatus.generalStatus': {
                        '$lt': 50
                    }
                }
            }, {
                '$addFields': {
                    totals: {
                        '$reduce': {
                            'input': '$products',
                            'initialValue': 0,
                            'in': {
                                '$add': ['$$value', { '$multiply': ['$$this.count', '$$this.price'] }]
                            }
                        }
                    },
                    'noPrice': {
                        '$cond': {
                            'if': { '$isArray': '$products' },
                            'then': {
                                '$size': {
                                    '$filter': {
                                        'input': '$products',
                                        'cond': {
                                            '$or': [
                                                {
                                                    '$eq': [
                                                        '$$this.price', 0
                                                    ]
                                                }, {
                                                    '$eq': [
                                                        '$$this.price', null
                                                    ]
                                                }, {
                                                    '$eq': [
                                                        {
                                                            '$type': '$$this.price'
                                                        }, 'missing'
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                            'else': 0
                        }
                    }
                }
            }, {
                '$group': {
                    '_id': '$customer',
                    'jobs': {
                        '$sum': 1
                    },
                    'totals': {
                        '$sum': '$totals'
                    },
                    'noPrice': {
                        '$sum': '$noPrice'
                    }
                }
            }, {
                '$sort': { '_id': 1, }
            }
        ];
        try {
            const resp = await jobs.aggregate<JobsWithoutInvoicesTotals>(pipeline).toArray();
            return {
                error: false,
                jobsWithoutInvoicesTotals: resp,
            };
        } catch (error) { return { error }; }
    }

    static async getJobsTotals(jobsId: number[]): Promise<InvoiceResponse> {
        const aggr = [
            {
                '$match': { 'jobId': { '$in': jobsId } }
            }, {
                '$unwind': { 'path': '$products' }
            }, {
                '$addFields': {
                    'products.total': {
                        '$multiply': ['$products.price', '$products.count']
                    }
                }
            }, {
                '$group': {
                    '_id': '$products.name',
                    'count': { '$sum': '$products.count' },
                    'total': { '$sum': '$products.total' }
                }
            }, {
                '$sort': {
                    '_id': 1,
                }
            }
        ];
        return {
            totals: await jobs.aggregate<ProductTotals>(aggr).toArray(),
            error: null,
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
            },
            {
                key: { invoiceId: 1 },
            },
            {
                key: { 'jobStatus.generalStatus': 1 },
            }
        ]);
    }

    static async createCollection(conn: MongoClient): Promise<void> {
        try {
            await conn.db(process.env.DB_BASE as string)
                .createCollection(JOBS_COLLECTION_NAME, {
                    validator: {
                        $jsonSchema: JOBS_SCHEMA,
                    }
                });
        } catch (_) { return; }
    }

    static async upgradeDb(): Promise<void> {
        return await jobs.updateMany(
            {
                jobStatus: { $exists: false },
                invoiceId: { $exists: false },
            },
            {
                $set: {
                    'jobStatus.generalStatus': 20,
                }
            }
        ).then(result => {
            if (result.modifiedCount > 0) {
                Logger.info(`Updated ${result.modifiedCount} jobs status to jobStatus.generalStatus: 20`);
            }

        }).then(_ =>
            jobs.updateMany(
                {
                    invoiceId: { $exists: true },
                },
                {
                    $set: {
                        'jobStatus.generalStatus': 50,
                    }
                }
            )
        ).then(result => {
            if (result.modifiedCount > 0) {
                Logger.info(`Updated ${result.modifiedCount} jobs status to jobStatus.generalStatus: 50`);
            }
        }).then(_ => jobs.updateMany(
            { products: { $elemMatch: { name: { $exists: true }, units: { $exists: false } } } },
            {
                $set: {
                    'products.$[].units': DEFAULT_UNIT
                }
            }
        )
        ).then(result => {
            if (result.modifiedCount > 0) {
                Logger.info(`Updated ${result.modifiedCount} jobs products.units to '${DEFAULT_UNIT}'`, result);
            }
        });
    }

    static validateJob<T extends Partial<Job>>(jobO: T): T {
        const job = { ...jobO };
        if (typeof job.receivedDate === 'string') {
            job.receivedDate = new Date(job.receivedDate);
        }
        if (typeof job.dueDate === 'string') {
            job.dueDate = new Date(job.dueDate);
        }
        return job;
    }

    static jobUpdate(job0: Partial<Job>): BulkWriteUpdateOperation<Job> {
        const jobId = job0.jobId as number;
        const job = this.validateJob(job0);
        delete job.jobId;
        if (job.products && !(job.products instanceof Array)) {
            const products: JobProduct = job.products;
            const idx: number = job.productsIdx ?? 0;
            Object.assign(
                job,
                ...(Object.keys(products) as Array<keyof JobProduct>).map(key => ({ [`products.${idx}.${key}`]: products[key] }))
            );
            delete job.products;
        }

        delete job.productsIdx;

        const update: UpdateQuery<Job> = {
            $set: { ...job }
        };

        return {
            filter: { jobId },
            update,
            upsert: false,
        };
    }

}
