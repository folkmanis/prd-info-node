import { Request, Response, NextFunction, RequestHandler } from 'express';
import { MongoClient } from 'mongodb';
import { User, UserPreferences } from './user-class';
import UsersDAO from '../dao/usersDAO';
import Logger from './logger';

export default class Preferences {
    static async getUserPreferences(req: Request, res: Response, next: NextFunction) {
        if (req.userPreferences) { // ja preferences jau ir, vēlreiz neiegūst
            next();
            return;
        }
        if (!req.session || !req.session.user) { // user not logged in
            Logger.debug('user not logged in');
            res.status(401).json({});
            return;
        }
        const user = req.session.user as User
        const prefs = await UsersDAO.getPreferences(user.username);
        if (!prefs) {
            Logger.error('User preferences not found');
            res.status(501).json('Server error');
            return;
        }
        req.userPreferences = prefs;
        next();
    }
}