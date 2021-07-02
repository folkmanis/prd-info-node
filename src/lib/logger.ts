import { NextFunction, Request, Response, RequestHandler } from 'express';
import { LogRecord } from '../interfaces';
import { LoggerDao } from '../dao';

interface Transport {
    minlevel: number, // minimālais svarīguma līmenis
    write: (rec: LogRecord) => void, // izvades funkcija
}

export enum LogLevels {
    ERROR = 10, WARN = 20, INFO = 30, VERBOSE = 40, DEBUG = 50, SILLY = 60
}

export default class Logger {
    static transports: Transport[] = []; // Izvades kanāli

    static async addTransport(tra: Transport) {
        Logger.transports.push(tra);
    }

    static log(level: LogLevels, message: string, metadata?: any) {
        const record: LogRecord = {
            level,
            timestamp: new Date(Date.now()),
            info: message,
            metadata,
        };
        for (const transp of Logger.transports) { // iet cauri izvades kanāliem
            if (level > transp.minlevel) { continue; } // ja nav līmenis, tad neko nedara
            transp.write(record); // izvada ierakstu
        }
    }

    static info(message: string, metadata?: any) {
        Logger.log(LogLevels.INFO, message, metadata);
    }

    static debug(message: string, metadata?: any) {
        Logger.log(LogLevels.DEBUG, message, metadata);
    }

    static error(message: string, metadata?: any) {
        Logger.log(LogLevels.ERROR, message, metadata);
    }

    static handler(): RequestHandler {
        return (req: Request, res: Response, next: NextFunction) => {
            req.log = Logger;
            next();
        };
    }
}

export class Console implements Transport {

    minlevel: LogLevels = process.env.NODE_ENV === 'development' ? LogLevels.SILLY : LogLevels.ERROR; // console raksta visu

    async write(rec: LogRecord): Promise<void> {
        const levStr = LogLevels[rec.level] || rec.level;
        console.log(`${levStr} | ${rec.timestamp.toLocaleString()} | ${rec.info}`);
        if (rec.metadata) {
            console.log(rec.metadata);
        }
    }
}

export class MongoLog implements Transport {
    minlevel: LogLevels = LogLevels.INFO;

    constructor(
        private logDao: LoggerDao
    ) { }

    async write(rec: LogRecord): Promise<void> {
        return this.logDao.write(rec);
    }
}
