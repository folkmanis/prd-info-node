import { Request, Response, NextFunction, RequestHandler } from 'express';
import session = require('express-session');
import mysqlSessionStore from 'express-mysql-session';
import mongoose, { Mongoose, Connection, Schema } from "mongoose";
import { Logger } from '@overnightjs/logger';
import { MysqlPool } from './mysql-connector';
// import {MongoStore} from 'connect-mongo';
const MongoStore = require('connect-mongo')(session);

export namespace PrdSession {

    export function validateSession(req: Request, res: Response, next: NextFunction) {
        if (req.session && req.session.user) {
            next();
        } else {
            Logger.Err('Not logged in');
            res.status(401).json(new Error('Not logged in'));
            // next(new Error('Not logged in'))
        }
    }

    export function validateAdminSession(req: Request, res: Response, next: NextFunction) {
        if (req.session && req.session.user.admin) {
            next();
        } else {
            Logger.Err('Admin not logged in');
            res.status(401).json(new Error('Admin not logged in'));
        }
    }

    export function sessionHandler(mysqlPool: MysqlPool): RequestHandler {
        let sessionStore = new mysqlSessionStore({}, mysqlPool.pool);
        return session({
            secret: 'HGG50EtOT7',
            store: sessionStore,
            cookie: {
                maxAge: (process.env.SESSION_EXPIRES ? +process.env.SESSION_EXPIRES : 259200) * 1000,
                httpOnly: true,
                sameSite: true,
            },
            saveUninitialized: false,
            unset: 'destroy',
            resave: false,
        })
    }

    export function sessionHandlerMongo(conn: Connection): RequestHandler {
        const sessionStore = new MongoStore({mongooseConnection: conn});
        return session({
            secret: 'HGG50EtOT7',
            store: sessionStore,
            cookie: {
                maxAge: (process.env.SESSION_EXPIRES ? +process.env.SESSION_EXPIRES : 259200) * 1000,
                httpOnly: true,
                sameSite: true,
            },
            saveUninitialized: false,
            unset: 'destroy',
            resave: false,
        })
    }

}
