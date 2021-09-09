import { Request, Response, NextFunction, RequestHandler } from 'express';
import { MongoClient } from 'mongodb';
import session from 'express-session';
import Logger from './logger';
import '../session/session';
import MongoStore from 'connect-mongo';
import { Modules } from '../interfaces';

// type Modules = 'xmf-search' | 'jobs' | 'xmf-upload' | 'jobs' | 'jobs-admin' | 'kastes' | 'admin' | 'calculations';

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

  static validateModule(mod: Modules): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      if (req.userPreferences?.modules?.includes(mod)) {
        next();
      } else {
        res.status(401).json({});
      }
    };
  }

  static injectDB(conn: string): RequestHandler {
    const sessionStore = MongoStore.create({
      mongoUrl: conn,
      stringify: false,
    });
    Logger.debug('session handler started');
    return session({
      secret: 'HGG50EtOT7',
      store: sessionStore,
      cookie: {
        maxAge:
          (process.env.SESSION_EXPIRES
            ? +process.env.SESSION_EXPIRES
            : 259200) * 1000,
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
