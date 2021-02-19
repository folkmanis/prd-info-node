import { Controller, ClassMiddleware, Middleware, Post, ClassWrapper, Get, Delete, Put, ClassErrorMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import { PrdSession } from '../lib/session-handler';
import { Preferences } from '../lib/preferences-handler';
import { PaytraqDAO } from '../dao/paytraqDAO';
import { logError } from '../lib/errorMiddleware';
import { PaytraqSale, RequestOptions } from '../interfaces/paytraq';
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
            data: await PaytraqDAO.getClients(options(req), prefs),
            error: false,
        });
    }

    @Get('client/:id')
    private async getClient(req: Request, res: Response) {
        const id = +req.params.id;
        const prefs = req.systemPreferences?.get('paytraq') as PaytraqSystemPreference;

        res.json({
            data: await PaytraqDAO.getClient(id, prefs),
            error: false,
        });
    }

    @Get('products')
    private async getProducts(req: Request, res: Response) {
        const prefs = req.systemPreferences?.get('paytraq') as PaytraqSystemPreference;
        res.json({
            data: await PaytraqDAO.getProducts(options(req), prefs),
            error: false,
        });
    }

    @Get('product/:id')
    private async getProduct(req: Request, res: Response) {
        const id = +req.params.id;
        const prefs = req.systemPreferences?.get('paytraq') as PaytraqSystemPreference;

        res.json({
            data: await PaytraqDAO.getProduct(id, prefs),
            error: false,
        });
    }

    @Get('sales')
    private async getSales(req: Request, res: Response) {
        const prefs = req.systemPreferences?.get('paytraq') as PaytraqSystemPreference;

        res.json({
            data: await PaytraqDAO.getSales(options(req), prefs),
            error: false,
        });
    }

    @Get('sale/:id')
    private async getSale(req: Request, res: Response) {
        const id = +req.params.id;
        const prefs = req.systemPreferences?.get('paytraq') as PaytraqSystemPreference;

        res.json({
            data: await PaytraqDAO.getSale(id, prefs),
            error: false,
        });
    }

    @Post('sale')
    private async postSale(req: Request, res: Response) {
        const prefs = req.systemPreferences?.get('paytraq') as PaytraqSystemPreference;
        const data: Partial<PaytraqSale> = req.body.data;
        if (!data?.sale) {
            throw new Error('Missing sale data');
        }

        const resp = await PaytraqDAO.postSale(data, prefs);
        if (resp.response?.documentID) {
            res.status(201).send({
                data: resp,
                error: false,
            });
        } else {
            throw new Error(JSON.stringify(resp));

        }


    }
}

function options({ query: { page, query } }: Request): RequestOptions {
    return {
        page: page ? +page : undefined,
        query: typeof query === 'string' ? query : undefined,
    };
}
