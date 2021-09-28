import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database';
import { Collection, Db, ObjectId, Cursor } from 'mongodb';
import { XmfJobsFilter } from '../dto/xmf-jobs-filter';
import { ArchiveJob } from '../entities/xmf-archive.interface';
import { Observable, of, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class XmfSearchDao {

    private db = this.dbService.db();

    private collection: Collection<ArchiveJob> = this.db.collection('xmfarchives');

    constructor(
        private readonly dbService: DatabaseService,
    ) {
        this.createIndexes();
    }


    async findJobs(
        filter: XmfJobsFilter,
        start: number,
        limit: number,
    ) {
        return this.collection.find(
            filter.toFilter(),
            {
                projection: {
                    _id: 0,
                    JDFJobID: 1,
                    DescriptiveName: 1,
                    CustomerName: 1,
                    'Archives.Location': 1,
                    'Archives.Date': 1,
                    'Archives.Action': 1,
                    'Archives.yearIndex': 1,
                    'Archives.monthIndex': 1,
                },
                skip: start,
                limit,
                sort: {
                    'Archives.yearIndex': -1,
                    'Archives.monthIndex': -1,
                }
            }
        )
            .toArray();
    }

    async getCount(filter: XmfJobsFilter): Promise<number> {
        return this.collection.countDocuments(filter.toFilter());
    }

    async findFacet(filter: XmfJobsFilter) {
        const pipeline = [
            { $match: filter.toFilter() },
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

    async findAllCustomers(): Promise<string[]> {
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
        const customers = await this.collection.aggregate<{ _id: string; }>(pipeline).toArray();
        return customers.map((res) => res._id);

    }

    private createIndexes() {
        this.collection.createIndexes([
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
                    'Archives.monthIndex': -1,
                },
                name: 'yearIndex_monthIndex',
            },
        ]);

    }

    insertManyRx(jobs: ArchiveJob[]): Observable<{ modifiedCount: number, upsertedCount: number; }> {
        if (jobs.length === 0) {
            return of({ modifiedCount: 0, upsertedCount: 0 });
        }

        const update = jobs.map(job => ({
            updateOne: {
                filter: {
                    JobID: job.JobID,
                    JDFJobID: job.JDFJobID,
                },
                update: { $set: job },
                upsert: true,
            },
        }));

        return from(this.collection.bulkWrite(update)).pipe(
            map(({ modifiedCount, upsertedCount }) => ({
                modifiedCount: modifiedCount || 0,
                upsertedCount: upsertedCount || 0,
            }))
        );
    }

    /*     async insertJob(
            jobs: ArchiveJob | ArchiveJob[],
        ): Promise<{ modified: number; upserted: number; }> {
            if (!(jobs instanceof Array)) {
                jobs = [jobs];
            }
            try {
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
