import { MongoClient, Collection } from "mongodb";
import { ArchiveJob, ArchiveSearchParams } from '../lib/xmf-archive-class';
import { UserPreferences } from "../lib/user-class";
import Logger from '../lib/logger';

interface ArchiveSearchResult {
    count: number;
    data?: Partial<ArchiveJob>[];
}

interface Count { _id: string, count: number };

export interface FacetResult {
    customerName: Count[],
    year: Count[],
    month: Count[],
}

let archives: Collection<Partial<ArchiveJob>>;

export class xmfSearchDAO {

    static async injectDB(conn: MongoClient) {
        if (archives) {
            return;
        }
        try {
            archives = conn.db(process.env.DB_BASE as string)
                .collection('xmfarchives');
        } catch (e) {
            Logger.error(`xmfSearchDAO: unable to connect`, e);
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
        }

        const result: ArchiveSearchResult = { count: 0, data: [] };
        const filter = xmfSearchDAO.filter(search, userPreferences.customers);

        Logger.debug(JSON.stringify(filter));
        const findRes = archives.find(filter);
        result.count = await findRes
            .count();
        result.data = await findRes
            .project(projection)
            .map(res => ({ ...res, exactMatch: res.JDFJobID === search.q }))
            .sort(sort)
            .limit(100)
            .toArray();
        return result;
    }

    static async facet(search: ArchiveSearchParams, userPreferences: UserPreferences): Promise<any> {
        const filter = xmfSearchDAO.filter(search, userPreferences.customers);
        const pipeline = [
            { $match: filter },
            {
                $facet:
                {
                    customerName: [{ $sortByCount: '$CustomerName' }],
                    year: [
                        { $unwind: '$Archives' },
                        { $match: {'Archives.Action': 1}},
                        { $group: { _id: "$Archives.yearIndex", count: { $sum: 1 } } },
                        { $sort: { _id: -1 } },
                    ],
                    month: [
                        { $unwind: '$Archives' },
                        { $match: {'Archives.Action': 1}},
                        { $group: { _id: "$Archives.monthIndex", count: { $sum: 1 } } },
                        { $sort: { _id: 1 } },
                    ],
                }
            }
        ]
        const findres = archives.aggregate(pipeline);
        return (await findres.toArray())[0];

    }

    static async insertJob(job: ArchiveJob): Promise<{ modified: number, upserted: number }> {
        const filter = {
            JobID: job.JobID,
            JDFJobID: job.JDFJobID,
        }
        // TODO optimizēt
        try {
            const updResult = await archives.updateOne(filter, { $set: job }, { upsert: true });
            return { modified: updResult.modifiedCount, upserted: updResult.upsertedCount };

        } catch (e) {
            Logger.error('error: ', e)
            return { modified: 0, upserted: 0 };
        }
    }

    static async getCustomers(): Promise<string[]> {
        const pipeline = [{$group: {
            _id: "$CustomerName"
          }}, {$sort: {
            _id: 1
          }}];
          return (await archives.aggregate<{_id: string}>(pipeline).toArray()).map(res => res._id);
    }

    private static filter(search: ArchiveSearchParams, customers: string[]): { [key: string]: any } {
        const filter: { [key: string]: any } = {
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
