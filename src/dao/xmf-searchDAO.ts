import { MongoClient, Collection } from "mongodb";
import { ArchiveJob } from '../lib/xmf-archive-class';

interface ArchiveSearchResult {
    count: number;
    data?: Partial<ArchiveJob>[];
}

let archives: Collection<Partial<ArchiveJob>>;

export default class xmfSearchDAO {

    static async injectDB(conn: MongoClient) {
        if (archives) {
            return;
        }
        try {
            archives = conn.db(process.env.DB_BASE as string)
                .collection('xmfarchives');
        } catch (e) {
            console.error(`xmfSearchDAO: unable to connect ${e}`);
        }
    }

    static async findJob(
        text: string, customers?: string
    ): Promise<ArchiveSearchResult> {
        const projection = {
            _id: 0,
            JDFJobID: 1,
            DescriptiveName: 1,
            CustomerName: 1,
            "Archives.Location": 1,
            "Archives.Date": 1,
            "Archives.Action": 1,
            // exactMatch: {$eq: ["$JDFJobID", text]},
        };
        const sort = {
                "Archives.yearIndex": -1,
                "Archives.monthIndex": -1,
        }

        const result: ArchiveSearchResult = { count: 0, data: [] };
        const filter: any = {
            $or: [
                { DescriptiveName: { $regex: text, $options: 'i' } },
                { JDFJobID: text },
            ]
        };
        if (customers) {
            filter.CustomerName = { $in: customers.split(',') };
        }
        console.log(JSON.stringify(filter));
        const findRes = archives.find(filter);
        result.count = await findRes
            .count();
        result.data = await findRes
            .project(projection)
            .sort(sort)
            .limit(100)
            .toArray();
        return result;
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
            console.log('error: ', e)
            return { modified: 0, upserted: 0 };
        }
    }

}
