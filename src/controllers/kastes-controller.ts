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

@Controller('data/kastes')
@ClassErrorMiddleware(logError)
@ClassMiddleware([
    Preferences.getUserPreferences,
    PrdSession.validateSession,
    PrdSession.validateModule('kastes')
])
@ClassWrapper(asyncWrapper)
export class KastesController {

    @Put('')
    private async table(req: Request, res: Response) {
        const veikali = req.body.data as KastesVeikals[];
        const pasutijums = new ObjectId(req.body.orderId);
        const lastModified = new Date();
        const resp = await KastesDAO.veikaliAdd(pasutijums, veikali
            .map(vk => ({
                ...vk,
                pasutijums,
                lastModified,
            }))
        );
        res.json(resp);
        req.log.info('kastes order table inserted', resp);
    }


    @Post('preferences')
    private async postPreferences(req: Request, res: Response) {
        req.log.debug('post kastes preferences', req.body);
        const username = req.session?.user.username || '';
        const preferences = req.body;
        res.json(
            await UsersDAO.updateUserPreferences(username, 'kastes', preferences)
        );
    }

    @Post('label')
    private async setLabel(req: Request, res: Response) {
        const pasutijumsId: ObjectId = new ObjectId(req.query.pasutijumsId as string);
        const kods = req.body.kods;
        req.log.info('set kastes label', { pasutijumsId, kods });
        res.json(
            await KastesDAO.setLabel(pasutijumsId, kods)
        );
    }

    @Post(':id/:kaste/gatavs/:yesno')
    private async setGatavs(req: Request, res: Response) {
        const params = {
            id: new ObjectId(req.params.id as string),
            kaste: +req.params.kaste,
            yesno: +req.params.yesno ? true : false,
        };
        req.log.debug('post gatavs', params);
        // const { field, id, kaste, yesno } = req.body;
        res.json(
            await KastesDAO.setGatavs(params)
        );
    }

    @Get('preferences')
    private async getPreferences(req: Request, res: Response) {
        const username = req.session?.user.username || '';
        res.json(
            await UsersDAO.getUserPreferences(username, 'kastes')
        );
    }

    @Get('apjomi')
    async getApjomi(req: Request, res: Response) {
        const pasutijumsId: ObjectId = new ObjectId(req.query.pasutijumsId as string);
        res.json(
            await KastesDAO.kastesApjomi(pasutijumsId)
        );
    }

    @Get(':id')
    private async getKaste(req: Request, res: Response) {
        const kaste = req.query.kaste ? +req.query.kaste : 0;
        const id = new ObjectId(req.params.id);
        res.json(
            await KastesDAO.getKaste(id, kaste)
        );
    }

    @Get('')
    private async getKastes(req: Request, res: Response) {
        req.log.debug('get kastes', req.query.pasutijumsId);
        const pasutijumsId: ObjectId = new ObjectId(req.query.pasutijumsId as string);
        res.json(
            await KastesDAO.kastesList(pasutijumsId)
        );
    }

}
