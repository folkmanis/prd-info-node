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

POST defaults
atiestata vienu moduli
{module: string}
response {updated: 0 | 1}

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

    @Middleware(PrdSession.validateModule('admin')) // Mainīt var tikai
    @Put('update')
    private async updatePreferences(req: Request, res: Response) {
        const pref = req.body.preferences;
        req.log.debug('put preferences update', pref);
        const result = await PreferencesDAO.updatePreferences(pref);
        res.json(result);
    }

    @Post('defaults')
    private async resetModule(req: Request, res: Response) {
        const mod = req.body.module as string;
        if (!mod) { res.json({ updated: 0 }); }
        res.json(
            { updated: (await PreferencesDAO.setDefaults(mod)) ? 1 : 0 }
        );
    }

    @Get('all')
    private async getAllPreferences(req: Request, res: Response) {
        res.json(
            await PreferencesDAO.getAllPreferences()
        );
    }

    @Get('single')
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