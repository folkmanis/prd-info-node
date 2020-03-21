import { MongoClient, Collection, IndexSpecification } from 'mongodb';

export interface LogRecord {
    level: number,
    timestamp: Date,
    info: string,
    metadata?: { [key: string]: any; },
}

export interface LogReadResponse {
    count: number,
    data: LogRecord[],
}

const indexes: IndexSpecification[] = [
    {
        key: { timestamp: -1 },
        name: 'timestamp',
    },
    {
        key: { level: 1 },
        name: 'level'
    }
];

let log: Collection<LogRecord>;

export class LoggerDAO {
    static async injectDB(conn: MongoClient, params = {
        collection: 'log'
    }) {
        if (log) {
            return;
        }
        try {
            log = conn.db(process.env.DB_BASE as string).collection(params.collection);
            LoggerDAO.createIndexes();
        } catch (e) {
            console.error(e);
        }
    }

    static write(record: LogRecord) {
        log.insertOne(record, { w: 0 });
        return;
    }

    static async read(params: {
        limit: number,
        start: number,
        level?: number,
        dateTo: Date,
        dateFrom: Date,
    }): Promise<LogReadResponse> {
        const filter: any = {
            $and: [
                { timestamp: { $lte: params.dateTo } },
                { timestamp: { $gte: params.dateFrom } },
            ]
        };
        if (params.level) {
            filter.level = { $lte: params.level };
        }
        const findres = log.find<LogRecord>(filter).sort({ timestamp: -1 });
        return {
            count: await findres.count(),
            data: await findres.limit(params.limit).toArray(),
        };

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
