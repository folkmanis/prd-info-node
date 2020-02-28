import { MongoClient, Collection, ObjectId } from "mongodb";
import { ArchiveJob, ArchiveSearchParams } from '../lib/xmf-archive-class';
import { UserPreferences } from "../lib/user-class";
import { ArchiveSearchResult, FacetResult, XmfUploadProgress } from '../lib/xmf-archive-class';
import Logger from '../lib/logger';

let archives: Collection<Partial<ArchiveJob>>;
let xmfUploadProgress: Collection<Partial<XmfUploadProgress>>;

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

            }
        }
    }

    static async findJob(search: ArchiveSearchParams, userPreferences: UserPreferences): Promise<ArchiveSearchResult> {
        const projection = {
            _id: 0,
            JDFJobID: 1,
            DescriptiveName: 1,
            CustomerName: 1,
            "Archives.Location": 1,
            "Archives.Date": 1,
            "Archives.Action": 1,
        };
        const sort = {
            exactMatch: 1,
            "Archives.yearIndex": -1,
            "Archives.monthIndex": -1,
        };

        const filter = xmfSearchDAO.filter(search, userPreferences.customers);
        // Parastā meklēšana
        Logger.debug(JSON.stringify(filter));
        const findRes = archives.find(filter);
        const count = await findRes
            .count();
        const data = await findRes
            .project(projection)
            .map(res => ({ ...res, exactMatch: res.JDFJobID === search.q }))
            .sort(sort)
            .limit(100)
            .toArray();
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
        const facet = (await archives.aggregate<FacetResult>(pipeline).toArray())[0];
        return { count, data, facet };

    }

    static async insertJob(jobs: ArchiveJob | ArchiveJob[]): Promise<{ modified: number, upserted: number; }> {
        if (!(jobs instanceof Array)) { jobs = [jobs]; }
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
            if (update.length === 0) { return { modified: 0, upserted: 0 }; }
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
                        'Archives.yearIndex': 1,
                        'Archives.monthIndex': 1,
                    },
                    name: 'year_month',
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

    static async getCustomers(): Promise<string[]> {
        const pipeline = [{
            $group: {
                _id: "$CustomerName"
            }
        }, {
            $sort: {
                _id: 1
            }
        }];
        return (await archives.aggregate<{ _id: string; }>(pipeline).toArray()).map(res => res._id);
    }

    static async startUploadProgress(log: Partial<XmfUploadProgress>): Promise<ObjectId | null> {
        if (log._id) { return null; }
        return (await xmfUploadProgress.insertOne(log)).insertedId;
    }

    static async updateUploadProgress(log: Partial<XmfUploadProgress>): Promise<boolean> {
        if (!log._id) { return false; }
        return !!(await xmfUploadProgress.updateOne({ _id: log._id }, { $set: log }, { w: 0 })).result.ok;
    }

    static async getUploadStatus(): Promise<Partial<XmfUploadProgress>[]>;
    static async getUploadStatus(_id: ObjectId): Promise<Partial<XmfUploadProgress> | null>;
    static async getUploadStatus(_id?: ObjectId): Promise<Partial<XmfUploadProgress> | Partial<XmfUploadProgress>[] | null> {
        if (!_id) {
            return await xmfUploadProgress.find(
                {},
                { sort: [['_id', -1]] }
            ).toArray();
        } else {
            return await xmfUploadProgress.findOne({ _id });
        }
    }

    private static filter(search: ArchiveSearchParams, customers: string[]): { [key: string]: any; } {
        const filter: { [key: string]: any; } = {
            $or: [
                { JDFJobID: search.q },
                { DescriptiveName: { $regex: search.q, $options: 'i' } },
            ]
        };
        filter.CustomerName = {
            $in:
                search.customerName ? search.customerName : customers
        };
        if (search.year) {
            filter["Archives.yearIndex"] = { $in: search.year };
        }
        if (search.month) {
            filter["Archives.monthIndex"] = { $in: search.month };
        }

        return filter;
    }

}
