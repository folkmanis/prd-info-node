import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database';
import { Collection, Db, ObjectId, Cursor } from 'mongodb';
import { ArchiveSearchQuery } from '../dto/archive-search-query.dto';
import { intersection } from 'lodash';
import { ArchiveJob } from '../entities/xmf-archive.interface';

@Injectable()
export class XmfSearchDao {

    private db = this.dbService.db();

    private collection: Collection<ArchiveJob> = this.db.collection('xmfarchives');
    // private archSorted: Collection<ArchiveJob> = this.db.collection('xmfArchiveSorted');

    constructor(
        private readonly dbService: DatabaseService,
    ) { }


    private lastUpdate: Date | undefined; // datums, kad bijušas pēdējās izmaiņas datubāzē
    private sortedDbDate: Date | undefined; // šķirotās datubāzes laiks


    // await this.sortedDb();

    async findJobs(
        query: ArchiveSearchQuery,
        customers: string[],
        start: number,
        limit: number,
    ) {

        const filter = new XmfJobsFilter(query, customers);
        const cursor = this.collection.find(filter.toObject())
            .project({
                _id: 0,
                JDFJobID: 1,
                DescriptiveName: 1,
                CustomerName: 1,
                'Archives.Location': 1,
                'Archives.Date': 1,
                'Archives.Action': 1,
                'Archives.yearIndex': 1,
                'Archives.monthIndex': 1,
            });
        const data = await cursor
            .skip(start)
            .limit(limit)
            .toArray();

        if (start !== 0) {
            return {
                data
            };
        } else {
            return {
                data,
                count: await cursor.count(),
                facet: await this.getFacetResult(filter.toObject()),
            };
        }

    }

    private async getFacetResult(filter: Record<string, any>) {
        const pipeline = [
            { $match: filter },
            {
                $facet: {
                    customerName: [{ $sortByCount: '$CustomerName' }],
                    year: [
                        { $unwind: '$Archives' },
                        { $match: { 'Archives.Action': 1 } },
                        { $group: { _id: '$Archives.yearIndex', count: { $sum: 1 } } },
                        { $sort: { _id: -1 } },
                    ],
                    month: [
                        { $unwind: '$Archives' },
                        { $match: { 'Archives.Action': 1 } },
                        { $group: { _id: '$Archives.monthIndex', count: { $sum: 1 } } },
                        { $sort: { _id: 1 } },
                    ],
                },
            },
        ];
        const aggregation = await this.collection.aggregate(pipeline).toArray();
        return aggregation[0];

    }

    /*     async insertJob(
            jobs: ArchiveJob | ArchiveJob[],
        ): Promise<{ modified: number; upserted: number; }> {
            if (!(jobs instanceof Array)) {
                jobs = [jobs];
            }
            if (jobs.length === 0) {
                return { modified: 0, upserted: 0 };
            }
            const update = jobs.map((job) => ({
                updateOne: {
                    filter: {
                        JobID: job.JobID,
                        JDFJobID: job.JDFJobID,
                    },
                    update: { $set: job },
                    upsert: true,
                },
            }));
            try {
                const updResult = await this.archives.bulkWrite(update);
                this.archives.createIndexes([
                    { key: { JDFJobID: 1 }, name: 'JDFJobID' },
                    {
                        key: {
                            JobID: 1,
                            JDFJobID: 1,
                        },
                        name: 'JobID_1_JDFJobID_1',
                        unique: true,
                    },
                    {
                        key: {
                            'Archives.yearIndex': -1,
                        },
                    },
                    {
                        key: {
                            'Archives.monthIndex': -1,
                        },
                    },
                    {
                        key: { _id: 1 },
                        name: '_id_',
                    },
                ]);
                return {
                    modified: updResult.modifiedCount || 0,
                    upserted: updResult.upsertedCount || 0,
                };
            } catch (e) {
                Logger.error('error: ', e);
                return { modified: 0, upserted: 0 };
            }
        }
    
        async getCustomers(): Promise<XmfArchiveResponse> {
            const pipeline = [
                {
                    $group: {
                        _id: '$CustomerName',
                    },
                },
                {
                    $sort: {
                        _id: 1,
                    },
                },
            ];
            try {
                return {
                    error: false,
                    xmfCustomers: (
                        await this.archives.aggregate<{ _id: string; }>(pipeline).toArray()
                    ).map((res) => res._id),
                };
            } catch (error) {
                return { error };
            }
        }
    
        async customersToCustomersDb(dbName: string) {
            const pipeline: any[] = [
                {
                    $group: {
                        _id: '$CustomerName',
                    },
                },
                {
                    $addFields: {
                        CustomerName: '$_id',
                        code: '$_id',
                        insertedFromXmf: new Date(),
                    },
                },
                {
                    $project: {
                        _id: 0,
                    },
                },
                {
                    $merge: {
                        into: dbName,
                        on: 'CustomerName',
                        whenMatched: 'keepExisting',
                        whenNotMatched: 'insert',
                    },
                },
            ];
            return await this.archives.aggregate(pipeline).toArray();
        }
    
        async startUploadProgress(
            log: Partial<XmfUploadProgress>,
        ): Promise<ObjectId | null> {
            if (log._id) {
                return null;
            }
            return (await this.xmfUploadProgress.insertOne(log)).insertedId;
        }
    
        async updateUploadProgress(
            log: Partial<XmfUploadProgress>,
        ): Promise<boolean> {
            if (!log._id) {
                return false;
            }
            this.lastUpdate = new Date();
            return !!(
                await this.xmfUploadProgress.updateOne(
                    { _id: log._id },
                    { $set: log },
                    { writeConcern: { w: 0 } },
                )
            ).result.ok;
        }
    
        async getUploadStatus(): Promise<Partial<XmfUploadProgress>[]>;
        async getUploadStatus(
            _id: ObjectId | undefined,
        ): Promise<Partial<XmfUploadProgress> | null>;
        async getUploadStatus(
            _id?: ObjectId | undefined,
        ): Promise<Partial<XmfUploadProgress> | Partial<XmfUploadProgress>[] | null> {
            if (!_id) {
                return await this.xmfUploadProgress
                    .find({}, { sort: [['_id', -1]] })
                    .toArray();
            } else {
                return await this.xmfUploadProgress.findOne({ _id });
            }
        }
    
    
        private async sortedDb(): Promise<void> {
            if (await this.isSortedDb()) {
                return;
            }
            const { projection, sort } = this.getProjection();
            await this.archives
                .aggregate([])
                .sort(sort)
                .project(projection)
                .out('xmfArchiveSorted')
                .toArray();
            this.sortedDbDate = projection.lastUpdate;
            this.archSorted.createIndexes([
                {
                    key: {
                        'Archives.yearIndex': -1,
                        'Archives.monthIndex': -1,
                    },
                    name: 'yearMonthIndex',
                },
            ]);
        }
        private getProjection() {
            return {
                projection: {
                    _id: 0,
                    JDFJobID: 1,
                    DescriptiveName: 1,
                    CustomerName: 1,
                    lastUpdate: new Date(Date.now()),
                    'Archives.Location': 1,
                    'Archives.Date': 1,
                    'Archives.Action': 1,
                    'Archives.yearIndex': 1,
                    'Archives.monthIndex': 1,
                },
                sort: {
                    'Archives.yearIndex': -1,
                    'Archives.monthIndex': -1,
                },
            };
        }
    
        private async isSortedDb(): Promise<boolean> {
            if (!this.lastUpdate) {
                this.lastUpdate =
                    (
                        await this.xmfUploadProgress.findOne(
                            {},
                            {
                                projection: { _id: 0, finished: 1 },
                                sort: { finished: -1 },
                            },
                        )
                    )?.finished || new Date(0);
            }
            if (!this.sortedDbDate) {
                this.sortedDbDate =
                    (await this.archSorted.findOne({}))?.lastUpdate || new Date(0);
            }
            return this.sortedDbDate.getTime() > this.lastUpdate.getTime();
        }
    }
        
     */

}

class XmfJobsFilter {

    constructor(
        private search: ArchiveSearchQuery,
        private customers: string[],
    ) { }

    toObject(): Record<string, any> {
        const filter: Record<string, any> = {};
        const { customerName, q, year, month } = this.search;
        const customers = customerName ? intersection(customerName, this.customers) : this.customers;
        filter.CustomerName = {
            $in: customers,
        };
        if (q) {
            filter['$or'] = [
                { JDFJobID: q },
                { DescriptiveName: { $regex: q, $options: 'i' } },
            ];
        }
        if (year) {
            filter['Archives.yearIndex'] = { $in: year };
        }
        if (month) {
            filter['Archives.monthIndex'] = { $in: month };
        }
        return filter;
    }

}