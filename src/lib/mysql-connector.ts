import mysql, { Pool, PoolConnection } from 'mysql';
import { Request, Response, NextFunction, Handler } from 'express';
import { Logger } from '@overnightjs/logger';

export class MysqlPool {

    pool: Pool;

    constructor() {
        Logger.Info(`db_user: ${process.env.DB_USER}`);
        this.pool = mysql.createPool({
            connectionLimit: 5,
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_BASE
        })
    }

    public poolConnect() {
        return async (req: Request, res: Response, next: NextFunction) => {
            const conn = await this.asyncConnection();
            res.on('close', () => conn.release());
            res.on('close', () => Logger.Info('conn released'));
            req.sqlConnection = conn;
            next();
        }
    }

    private asyncConnection(): Promise<PoolConnection> {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                Logger.Info('getConnection');
                if (err) {
                    reject(err);
                } else {
                    resolve(connection);
                }
            });
        })
    }

}

export const asyncQuery: <T>(conn: PoolConnection, q: string, params?: Array<any>) => Promise<T> =
    <T>(conn: PoolConnection, q: string, params?: Array<any>) => {
        return new Promise<T>((resolve, reject) => {
            conn.query(q, params, (err, result) => {
                err ? reject(err) : resolve(result);
            })
        })
    }


