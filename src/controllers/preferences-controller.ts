import { ClassMiddleware, ClassWrapper, Controller, Get, Middleware, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import { PreferencesDao } from '../dao';
import { Modules, SystemPreferenceModule } from '../interfaces';
import { asyncWrapper } from '../lib/asyncWrapper';
import { Preferences } from '../lib/preferences-handler';
import { PrdSession } from '../lib/session-handler';

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
        res.json({
            error: null,
            data: await this.preferencesDao.getAllPreferences()
        });
    }

}