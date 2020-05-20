import { NextFunction, Request, Response } from 'express';
import { PreferencesDAO } from '../dao/preferencesDAO';
import { UsersDAO } from '../dao/usersDAO';
import { User,SystemPreferenceModule } from '../interfaces';
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
        const user = req.session.user as User;
        const prefs = await UsersDAO.getPreferences(user.username);
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
        const sysPref = (await PreferencesDAO.getAllPreferences()).data as SystemPreferenceModule[] | undefined;
        if (!sysPref) {
            Logger.error('System preferences not found');
            res.status(501).json('Server error');
            return;
        }
        req.systemPreferences = new Map(sysPref.map(pref => [pref.module, pref.settings]));
        next();
    }


}