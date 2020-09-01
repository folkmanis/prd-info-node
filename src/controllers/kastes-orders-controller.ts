import {
    Controller, ClassMiddleware,
    Post, Put, Get, Delete,
    ClassWrapper, ClassErrorMiddleware
} from '@overnightjs/core';
import { Request, Response } from 'express';
import { ObjectId, Timestamp } from 'mongodb';
import { asyncWrapper } from '../lib/asyncWrapper';
import { PrdSession } from '../lib/session-handler';
import { Preferences } from '../lib/preferences-handler';
import { KastesDAO } from '../dao/kastesDAO';
import { UsersDAO } from '../dao/usersDAO';
import { KastesVeikals, KastesOrder } from '../interfaces';
import { logError } from '../lib/errorMiddleware';

@Controller('data/kastes-orders')
@ClassErrorMiddleware(logError)
@ClassMiddleware([
    Preferences.getUserPreferences,
    PrdSession.validateSession,
    PrdSession.validateModule('kastes')
])
@ClassWrapper(asyncWrapper)
export class KastesOrderController {

    @Get(':id')
    private async getOrder(req: Request, res: Response) {
        const id = new ObjectId(req.params.id);
        res.json(
            await KastesDAO.kastesOrder(id)
        );
    }

    @Get('')
    private async kastesOrders(req: Request, res: Response) {
        res.json(
            await KastesDAO.kastesOrders()
        );
    }

    @Put('')
    private async addpasutijums(req: Request, res: Response) {
        res.json(
            await KastesDAO.pasutijumsAdd(req.body as KastesOrder)
        );
    }

    @Post(':id')
    private async updatePasutijums(req: Request, res: Response) {
        const id = new ObjectId(req.params.id);
        const pas = req.body as Partial<KastesOrder>;
        delete pas._id;
        res.json(
            await KastesDAO.pasutijumsUpdate(id, pas)
        );
    }

    @Delete('')
    private async pasCleanup(req: Request, res: Response) {
        res.json(
            await KastesDAO.pasutijumiCleanup()
        );
    }


}
