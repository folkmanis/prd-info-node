import { Controller, ClassMiddleware, Middleware, Post, ClassWrapper, Get, Delete, Put, ClassErrorMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import { PrdSession } from '../lib/session-handler';
import { Preferences } from '../lib/preferences-handler';
import { PaytraqDAO } from '../dao/paytraqDAO';
import { logError } from '../lib/errorMiddleware';
import { RequestOptions } from '../interfaces/paytraq';
import { PaytraqSystemPreference } from '../interfaces/preferences.interface';

@Controller('data/paytraq')
@ClassErrorMiddleware(logError)
@ClassMiddleware([
    Preferences.getUserPreferences,
    Preferences.getSystemPreferences,
    PrdSession.validateSession,
    PrdSession.validateModule('jobs'),
])
@ClassWrapper(asyncWrapper)
export class PaytraqController {
    @Get('clients')
    private async getClients(req: Request, res: Response) {
        const options: RequestOptions = {
            page: req.query.page ? +req.query.page : undefined,
            query: validateString(req.query.query),
        };
        const prefs = req.systemPreferences?.get('paytraq') as PaytraqSystemPreference;

        res.json({
            data: await PaytraqDAO.getClients(options, prefs)
        });
    }

    @Get('client/:id')
    private async getClient(req: Request, res: Response) {
        const id = +req.params.id;
        const prefs = req.systemPreferences?.get('paytraq') as PaytraqSystemPreference;

        res.json({
            data: await PaytraqDAO.getClient(id, prefs)
        });
    }
}

function validateString(str: any): string | undefined {
    return typeof str === 'string' ? str : undefined;
}