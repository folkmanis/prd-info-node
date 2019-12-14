import { MongoClient } from 'mongodb';
import mongoLoggerDAO, { LogRecord } from '../dao/loggerDAO';

export { LogRecord } from '../dao/loggerDAO';

interface Transport {
    minlevel: number,
    write: (rec: LogRecord) => void,
}

enum levels {
    error = 0, warn = 10, info = 20, verbose = 30, debug = 40, silly = 50
}

export default class Logger {
    static transports: Transport[] = [];
    static async initLogger(conn: MongoClient) {
        Logger.transports.push(new Console());
        Logger.transports.push(new MongoLog(conn));
    }

    static log(level: levels, message: string, metadata?: any) {
        const record: LogRecord = {
            level,
            timestamp: new Date(Date.now()),
            info: message,
            metadata,
        }
        for (const transp of Logger.transports) {
            if (level > transp.minlevel) { continue; }
            transp.write(record);
        }
    }

    static info(message: string, metadata?: any) {
        Logger.log(levels.info, message, metadata);
    }
    static debug(message: string, metadata?: any) {
        Logger.log(levels.debug, message, metadata);
    }
}

class Console implements Transport {
    minlevel: levels = levels.silly;
    async write(rec: LogRecord): Promise<void> {
        console.log(`${rec.level}|${rec.timestamp.toLocaleString()} | ${rec.info}`);
        if (rec.metadata) {
            console.log(rec.metadata);
        }
    }
}

class MongoLog implements Transport {
    minlevel: levels = levels.info;

    constructor(private conn: MongoClient) {
        mongoLoggerDAO.injectDB(this.conn);
    }

    async write(rec: LogRecord): Promise<void> {
        return await mongoLoggerDAO.write(rec);
    }
}