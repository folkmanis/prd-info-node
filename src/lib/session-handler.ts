import { Request, Response, NextFunction, RequestHandler } from 'express';
import { MongoClient } from 'mongodb';
import session from 'express-session';
const MongoStore = require('connect-mongo')(session);

export default class PrdSession {

    static validateSession(req: Request, res: Response, next: NextFunction) {
        if (req.session && req.session.user) {
            next();
        } else {
            console.error('Not logged in');
            res.status(401).json(new Error('Not logged in'));
        }
    }

    static validateAdminSession(req: Request, res: Response, next: NextFunction) {
        if (req.session && req.session.user && req.session.user.admin) {
            next();
        } else {
            console.error('Admin not logged in');
            res.status(401).json(new Error('Admin not logged in'));
        }
    }

    static injectDB(conn: MongoClient): RequestHandler {
        const sessionStore = new MongoStore({ client: conn });
        console.log("session handler started");
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
