/*
/data/preferences
GET single
module: string
{module, settings: {key: value}} | {}

GET all
{module, settings: {key: value}}[]

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
import { PrdSession } from '../lib/session-handler';
import { Preferences } from '../lib/preferences-handler';


import { PreferencesDao } from '../dao-next/preferencesDAO';
import { Modules, SystemPreferenceModule, SystemPreferences } from '../interfaces';

@Controller('data/preferences')
@ClassMiddleware([
    Preferences.getUserPreferences,
    PrdSession.validateSession,
])
@ClassWrapper(asyncWrapper)
export class PreferencesController {

    constructor(
        private preferencesDao: PreferencesDao,
    ) { }

    @Middleware(PrdSession.validateModule('admin')) // Mainīt var tikai admins
    @Post(':module')
    private async resetModule(req: Request, res: Response) {
        const module = req.params.module as Modules;
        if (req.body.settings) {
            const pref: SystemPreferenceModule = {
                module,
                settings: req.body.settings,
            };
            res.json(
                await this.preferencesDao.updatePreferences(pref)
            );
        } else {
            res.json(
                await this.preferencesDao.setDefaults(module)
            );
        }
    }

    @Middleware(PrdSession.validateModule('admin')) // Mainīt var tikai admins
    @Post('')
    private async updatePreferences(req: Request, res: Response) {
        const pref = req.body as SystemPreferenceModule[];
        req.log.debug('put preferences update', pref);
        const result = await this.preferencesDao.updatePreferences(...pref);
        res.json(result);
    }

    @Get(':module')
    private async getPreferences(req: Request, res: Response) {
        const mod = req.params.module as Modules;
        req.log.debug('get preferences', mod);
        res.json(
            await this.preferencesDao.getModulePreferences(mod)
        );
    }

    @Get('')
    private async getAllPreferences(req: Request, res: Response) {
        res.json(
            await this.preferencesDao.getAllPreferences()
        );
    }

}