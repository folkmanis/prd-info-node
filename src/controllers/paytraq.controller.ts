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
        const prefs = req.systemPreferences?.get('paytraq') as PaytraqSystemPreference;

        res.json({
            data: await PaytraqDAO.getClients(options(req), prefs)
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

    @Get('products')
    private async getProducts(req: Request, res: Response) {
        const prefs = req.systemPreferences?.get('paytraq') as PaytraqSystemPreference;
        res.json({
            data: await PaytraqDAO.getProducts(options(req), prefs)
        });
    }

    @Get('product/:id')
    private async getProduct(req: Request, res: Response) {
        const id = +req.params.id;
        const prefs = req.systemPreferences?.get('paytraq') as PaytraqSystemPreference;

        res.json({
            data: await PaytraqDAO.getProduct(id, prefs)
        });
    }
}

function options({ query: { page, query } }: Request): RequestOptions {
    return {
        page: page ? +page : undefined,
        query: typeof query === 'string' ? query : undefined,
    };
}
