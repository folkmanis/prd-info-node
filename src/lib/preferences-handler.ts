import { NextFunction, Request, Response } from 'express';
import { User, SystemPreferenceModule } from '../interfaces';
import Logger from './logger';
import '../interfaces/session';
import { DaoIndexMap } from '../dao/dao-map';
import { UsersDao } from '../dao/usersDAO';
import { PreferencesDao } from '../dao/preferencesDAO';

let usersDao: UsersDao;
let preferencesDao: PreferencesDao;

export function insertDao(daoMap: DaoIndexMap) {
    usersDao = daoMap.getDao(UsersDao);
    preferencesDao = daoMap.getDao(PreferencesDao);
}

export class Preferences {
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
        const user = req.session.user as User;
        const prefs = await usersDao.getPreferences(user.username);
        if (!prefs) {
            Logger.error('User preferences not found');
            res.status(501).json('Server error');
            return;
        }
        req.userPreferences = prefs;
        next();
    }

    static async getSystemPreferences(req: Request, res: Response, next: NextFunction) {
        if (req.systemPreferences) {
            next();
            return;
        }
        if (!req.session || !req.session.user) { // user not logged in
            Logger.debug('user not logged in');
            res.status(401).json({});
            return;
        }
        const sysPref = await preferencesDao.getAllPreferences();
        if (!sysPref) {
            Logger.error('System preferences not found');
            res.status(501).json('Server error');
            return;
        }
        req.systemPreferences = new Map(sysPref.map(pref => [pref.module, pref.settings]));
        next();
    }


}