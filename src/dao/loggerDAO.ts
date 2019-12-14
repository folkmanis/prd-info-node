import { MongoClient, Collection, IndexSpecification } from 'mongodb';

export interface LogRecord {
    level: number,
    timestamp: Date,
    info: string,
    metadata?: { [key: string]: any },
}

const indexes: IndexSpecification[] = [
    {
        key: {
            timestamp: -1,
            level: 1,
        },
        name: "timestamp_level",
    }
]

let log: Collection<LogRecord>;

export default class LoggerDAO {
    static async injectDB(conn: MongoClient, params = {
        collection: 'log'
    }) {
        if (log) {
            return;
        }
        try {
            log = conn.db(process.env.DB_BASE as string).collection(params.collection);
            await LoggerDAO.createIndexes();
        } catch (e) {
            console.error(e);
        }
    }

    static async write(record: LogRecord) {
        const updresp = await log.insertOne(record, {w: 0});
        return;
    }

    static async read(params = {
        limit: 50,
        level: undefined,
        timestamp: Date.now(),
    }): Promise<LogRecord[]> {
        const filter: any = {
            timestamp: {$lte: params.timestamp}
        };
        if (params.level) {
            filter.level = {$lte: params.level};
        }
        const findres = log.find<LogRecord>(filter).sort({timestamp: -1}).limit(params.limit);
        return await findres.toArray();
    }

    private static async createIndexes(): Promise<boolean> {
        try {
            const updresp = await log.createIndexes(indexes);
            return !!updresp.ok;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
}
