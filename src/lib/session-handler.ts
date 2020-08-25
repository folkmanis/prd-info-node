import { Request, Response, NextFunction, RequestHandler } from 'express';
import { MongoClient } from 'mongodb';
import session from 'express-session';
import Logger from './logger';
const MongoStore = require('connect-mongo')(session);

type Modules = 'xmf-search' | 'jobs' | 'xmf-upload' | 'jobs' | 'jobs-admin' | 'kastes' | 'admin';

export class PrdSession {

    static validateSession(req: Request, res: Response, next: NextFunction) {
        if (req.session && req.session.user) {
            req.session.lastSeen = {
                ip: req.ip,
                date: new Date(),
            };
            next();
        } else {
            Logger.error('Not logged in');
            res.status(401).json(new Error('Not logged in'));
        }
    }

    static validateAdminSession(req: Request, res: Response, next: NextFunction) {
        if (req.session && req.session.user && req.session.user.admin) {
            next();
        } else {
            Logger.error('Admin not logged in');
            res.status(401).json(new Error('Admin not logged in'));
        }
    }
    /**
     * Pārbauda, vai lietotājam ir pieeja attiecīgajam modulim
     * @param mod Moduļa nosaukums, kuram pārbauda pieeju
     */
    static validateModule(mod: Modules): RequestHandler {
        return (req: Request, res: Response, next: NextFunction) => {
            if (req.userPreferences?.modules?.includes(mod)) {
                next();
            } else {
                res.json({});
            }
        };
    }

    static injectDB(conn: MongoClient): RequestHandler {
        const sessionStore = new MongoStore({ client: conn, stringify: false });
        Logger.debug("session handler started");
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
            rolling: true,
        });
    }

}
