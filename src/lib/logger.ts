import { Request, Response, NextFunction, RequestHandler } from 'express';
import { MongoClient } from 'mongodb';
import mongoLoggerDAO, { LogRecord } from '../dao/loggerDAO';

export { LogRecord } from '../dao/loggerDAO';

/**
 * Izvades kanāls
 */
interface Transport {
    minlevel: number, // minimālais svarīguma līmenis
    write: (rec: LogRecord) => void, // izvades funkcija
}
/**
 * Loga līmeņi
 */
export enum LogLevels {
    ERROR = 0, WARN = 10, INFO = 20, VERBOSE = 30, DEBUG = 40, SILLY = 50
}
/**
 * Statiskā klase darbībai ar logu
 */
export default class Logger {
    static transports: Transport[] = []; // Izvades kanāli
    /**
     * Pievieno izvades transportu
     * @param tra Transport klases objekts
     */
    static async addTransport(tra: Transport) {
        Logger.transports.push(tra);
    }
    /**
     * Pieņem log ierakstu
     * @param level svarīguma līmenis. Skaitlis no levels
     * @param message ziņojuma teksts
     * @param metadata papildus objekts brīvā formā
     */
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
    /**
     * Logger.info helper funkcija info līmenim 
     * @param message ziņojums
     * @param metadata objekts
     */
    static info(message: string, metadata?: any) {
        Logger.log(LogLevels.INFO, message, metadata);
    }
    /**
     * Logger.info helper funkcija debug līmenim 
     * @param message ziņojums
     * @param metadata objekts
     */
    static debug(message: string, metadata?: any) {
        Logger.log(LogLevels.DEBUG, message, metadata);
    }
    /**
     * Logger.info helper funkcija error līmenim 
     * @param message ziņojums
     * @param metadata objekts
     */
    static error(message: string, metadata?: any) {
        Logger.log(LogLevels.ERROR, message, metadata);
    }

    static handler(req: Request, res: Response, next: NextFunction) {
        req.log = Logger;
        next();
    }
}
/**
 * Log transporta klase konsoles izvadam
 */
export class Console implements Transport {
    minlevel: LogLevels = LogLevels.SILLY; // console raksta visu
    async write(rec: LogRecord): Promise<void> {
        const levStr = LogLevels[rec.level] || rec.level;
        console.log(`${levStr} | ${rec.timestamp.toLocaleString()} | ${rec.info}`);
        if (rec.metadata) {
            console.log(rec.metadata);
        }
    }
}
/**
 * Log transporta klases rakstīšanai mongo
 */
export class MongoLog implements Transport {
    minlevel: LogLevels = LogLevels.INFO;

    constructor(private conn: MongoClient) {
        mongoLoggerDAO.injectDB(this.conn);
    }

    async write(rec: LogRecord): Promise<void> {
        return await mongoLoggerDAO.write(rec);
    }
}