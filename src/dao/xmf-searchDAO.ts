import { MongoClient, Collection, ObjectId } from "mongodb";
import {
    UserPreferences,
    ArchiveJob,
    ArchiveSearchParams,
    ArchiveJobSorted,
    FacetResult,
    XmfUploadProgress,
    XmfArchiveResponse,
} from '../interfaces';
import Logger from '../lib/logger';

let archives: Collection<Partial<ArchiveJob>>; // galvenā datubāze
let archSorted: Collection<ArchiveJobSorted>; // šķirota datubāzes kopija
let xmfUploadProgress: Collection<Partial<XmfUploadProgress>>; // augšupielādes atskaite

let lastUpdate: Date | undefined; // datums, kad bijušas pēdējās izmaiņas datubāzē
let sortedDbDate: Date | undefined; // šķirotās datubāzes laiks

export class xmfSearchDAO {

    static async injectDB(conn: MongoClient) {
        if (!archives) {
            try {
                archives = conn.db(process.env.DB_BASE as string)
                    .collection('xmfarchives');
            } catch (e) {
                Logger.error(`xmfSearchDAO: unable to connect`, e);
            }
        }
        if (!xmfUploadProgress) {
            try {
                xmfUploadProgress = conn.db(process.env.DB_BASE as string)
                    .collection('xmf-upload-progress');
            } catch (e) {
                Logger.error(`xmfSearchDAO: unable to connect`, e);
            }
        }
        if (!archSorted) {
            try {
                archSorted = conn.db(process.env.DB_BASE as string)
                    .collection('xmfArchiveSorted');
            } catch (e) {
                Logger.error(`xmfSearchDAO: unable to connect`, e);
            }
        }
        await xmfSearchDAO.sortedDb();
    }

    static async findJobs(search: ArchiveSearchParams, userPreferences: UserPreferences): Promise<XmfArchiveResponse>;
    static async findJobs(search: ArchiveSearchParams, userPreferences: UserPreferences, start: string, lim?: string): Promise<XmfArchiveResponse>;
    static async findJobs(search: ArchiveSearchParams, userPreferences: UserPreferences, start?: string, lim = '100'): Promise<XmfArchiveResponse> {
        await xmfSearchDAO.sortedDb();
        const filter = xmfSearchDAO.getFilter(search, userPreferences.customers);
        Logger.debug(JSON.stringify(filter));
        const findRes = archSorted.find(filter);
        const data = await findRes
            .skip(+(start || 0))
            .limit(+lim)
            .toArray();
        // Ja vajadzīgs no-līdz, tad facet un count nemeklē
        if (start) {
            return {
                error: false,
                data
            };
        }
        // Kopējais skaits
        const count = await findRes.count();
        // Facet rezultāts
        const pipeline = [
            { $match: filter },
            {
                $facet:
                {
                    customerName: [{ $sortByCount: '$CustomerName' }],
                    year: [
                        { $unwind: '$Archives' },
                        { $match: { 'Archives.Action': 1 } },
                        { $group: { _id: "$Archives.yearIndex", count: { $sum: 1 } } },
                        { $sort: { _id: -1 } },
                    ],
                    month: [
                        { $unwind: '$Archives' },
                        { $match: { 'Archives.Action': 1 } },
                        { $group: { _id: "$Archives.monthIndex", count: { $sum: 1 } } },
                        { $sort: { _id: 1 } },
                    ],
                }
            }
        ];
        const facet = (await archSorted.aggregate<FacetResult>(pipeline).toArray())[0];
        return {
            error: false,
            count,
            data,
            facet
        };

    }

    static async insertJob(jobs: ArchiveJob | ArchiveJob[]): Promise<{ modified: number, upserted: number; }> {
        if (!(jobs instanceof Array)) { jobs = [jobs]; }
        if (jobs.length === 0) { return { modified: 0, upserted: 0 }; }
        const update = jobs.map(job => ({
            updateOne: {
                filter: {
                    JobID: job.JobID,
                    JDFJobID: job.JDFJobID,
                },
                update: { $set: job },
                upsert: true,
            }
        }));
        try {
            const updResult = await archives.bulkWrite(update);
            archives.createIndexes([
                { key: { JDFJobID: 1 }, name: 'JDFJobID' },
                {
                    key: {
                        JobID: 1,
                        JDFJobID: 1,
                    },
                    name: 'JobID_1_JDFJobID_1',
                    unique: true
                },
                {
                    key: {
                        'Archives.yearIndex': -1,
                    },
                },
                {
                    key: {
                        'Archives.monthIndex': -1,
                    }
                },
                {
                    key: { _id: 1 },
                    name: '_id_',
                }
            ]);
            return { modified: updResult.modifiedCount || 0, upserted: updResult.upsertedCount || 0 };

        } catch (e) {
            Logger.error('error: ', e);
            return { modified: 0, upserted: 0 };
        }
    }

    static async getCustomers(): Promise<XmfArchiveResponse> {
        const pipeline = [{
            $group: {
                _id: "$CustomerName"
            }
        }, {
            $sort: {
                _id: 1
            }
        }];
        try {
            return {
                error: false,
                xmfCustomers: (await archives.aggregate<{ _id: string; }>(pipeline).toArray()).map(res => res._id),
            };
        } catch (error) { return { error }; }
    }

    static async customersToCustomersDb(dbName: string) {
        const pipeline: any[] = [{
            $group: {
                _id: "$CustomerName"
            }
        }, {
            $addFields: {
                CustomerName: '$_id',
                code: '$_id',
                insertedFromXmf: new Date()
            }
        }, {
            $project: {
                _id: 0
            }
        }, {
            $merge: {
                into: dbName,
                on: 'CustomerName',
                whenMatched: 'keepExisting',
                whenNotMatched: 'insert'
            }
        }];
        return await archives.aggregate(pipeline).toArray();
    }

    static async startUploadProgress(log: Partial<XmfUploadProgress>): Promise<ObjectId | null> {
        if (log._id) { return null; }
        return (await xmfUploadProgress.insertOne(log)).insertedId;
    }

    static async updateUploadProgress(log: Partial<XmfUploadProgress>): Promise<boolean> {
        if (!log._id) { return false; }
        lastUpdate = new Date(Date.now());
        return !!(await xmfUploadProgress.updateOne({ _id: log._id }, { $set: log }, { writeConcern: { w: 0 } })).result.ok;
    }

    static async getUploadStatus(): Promise<Partial<XmfUploadProgress>[]>;
    static async getUploadStatus(_id: ObjectId | undefined): Promise<Partial<XmfUploadProgress> | null>;
    static async getUploadStatus(_id?: ObjectId | undefined): Promise<Partial<XmfUploadProgress> | Partial<XmfUploadProgress>[] | null> {
        if (!_id) {
            return await xmfUploadProgress.find(
                {},
                { sort: [['_id', -1]] }
            ).toArray();
        } else {
            return await xmfUploadProgress.findOne({ _id });
        }
    }

    private static getFilter(search: ArchiveSearchParams, customers: string[]): { [key: string]: any; } {
        const filter: { [key: string]: any; } = {};
        filter.CustomerName = {
            $in:
                search.customerName ? search.customerName : customers
        };
        if (search.q) {
            filter['$or'] =
                [
                    { JDFJobID: search.q },
                    { DescriptiveName: { $regex: search.q, $options: 'i' } },
                ];
        }
        if (search.year) {
            filter["Archives.yearIndex"] = { $in: search.year };
        }
        if (search.month) {
            filter["Archives.monthIndex"] = { $in: search.month };
        }
        return filter;
    }
    /** Izveido šķiroto kolekciju, ja vajag */
    private static async sortedDb(): Promise<void> {
        if (await xmfSearchDAO.isSortedDb()) { return; }
        const { projection, sort } = xmfSearchDAO.getProjection();
        await archives.aggregate([])
            .sort(sort)
            .project(projection)
            .out('xmfArchiveSorted')
            .toArray();
        sortedDbDate = projection.lastUpdate;
        archSorted.createIndexes([
            {
                key: {
                    'Archives.yearIndex': -1,
                    'Archives.monthIndex': -1,
                },
                name: 'yearMonthIndex',
            },
        ]);
    }
    private static getProjection() {
        return {
            projection: {
                _id: 0,
                JDFJobID: 1,
                DescriptiveName: 1,
                CustomerName: 1,
                lastUpdate: new Date(Date.now()),
                "Archives.Location": 1,
                "Archives.Date": 1,
                "Archives.Action": 1,
                "Archives.yearIndex": 1,
                "Archives.monthIndex": 1,
            },
            sort: {
                "Archives.yearIndex": -1,
                "Archives.monthIndex": -1,
            },
        };
    }
    /** Vai šķirotā datubāze ir jaunākā versija */
    private static async isSortedDb(): Promise<boolean> {
        if (!lastUpdate) {
            lastUpdate = (await xmfUploadProgress.findOne({}, {
                projection: { _id: 0, finished: 1, }, sort: { finished: -1 }
            }))?.finished || new Date(0);
        }
        if (!sortedDbDate) {
            sortedDbDate = (await archSorted.findOne({}))?.lastUpdate || new Date(0);
        }
        return sortedDbDate.getTime() > lastUpdate.getTime();
    }

}
