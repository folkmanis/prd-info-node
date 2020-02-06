/*
/data/preferences
GET 
module: string
{module, settings: {key: value}} | {}

PUT update
viens modulis vai masīvs no vairākiem moduļiem
preferences: {
    module: string
    settings: {key: value}
} |
preferences: {
    module: string
    settings: {key: value}
} []


*/

import { Controller, ClassMiddleware, Middleware, Post, ClassWrapper, Get, Delete, Put } from '@overnightjs/core';
import { Request, Response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import PrdSession from '../lib/session-handler';
import Preferences from '../lib/preferences-handler';


import { PreferencesDAO } from '../dao/preferencesDAO';

@Controller('data/preferences')
@ClassMiddleware([
    Preferences.getUserPreferences,
    PrdSession.validateSession,
])
@ClassWrapper(asyncWrapper)
export class PreferencesController {

    @Middleware(PrdSession.validateModule('admin')) // Mainīt var tikai ar admin pieeju
    @Put('update')
    private async updatePreferences(req: Request, res: Response) {
        const pref = req.body.preferences;
        req.log.debug('put preferences update', pref);
        const result = await PreferencesDAO.updatePreferences(pref);
        res.json(result);
    }

    @Get('')
    private async getPreferences(req: Request, res: Response) {
        const mod = req.query.module;
        req.log.debug('get preferences', mod);
        if (!mod) {
            res.json({});
            return;
        }
        res.json(
            await PreferencesDAO.getModulePreferences(mod)
        );
    }
}