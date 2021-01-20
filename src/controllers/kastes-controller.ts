import {
    ClassErrorMiddleware, ClassMiddleware,
    ClassWrapper, Controller,
    Delete,
    Get, Post, Put
} from '@overnightjs/core';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { jobsDAO } from '../dao/jobsDAO';
import { KastesDAO } from '../dao/kastesDAO';
import { UsersDAO } from '../dao/usersDAO';
import { Veikals } from '../interfaces';
import '../interfaces/session';
import { asyncWrapper } from '../lib/asyncWrapper';
import { logError } from '../lib/errorMiddleware';
import { Preferences } from '../lib/preferences-handler';
import { PrdSession } from '../lib/session-handler';

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
        const veikali = req.body.data as Veikals[];
        const pasutijums = +req.body.orderId;
        if (isNaN(pasutijums)) { throw new Error('jobId not provided'); }
        const lastModified = new Date();
        const resp = await KastesDAO.veikaliAdd(pasutijums, veikali
            .map(vk => ({
                ...vk,
                pasutijums,
                lastModified,
            }))
        );
        await jobsDAO.updateJob(pasutijums, { isLocked: true });
        res.json(resp);
        req.log.info('kastes order table inserted', resp);
    }


    @Post('preferences')
    private async postPreferences(req: Request, res: Response) {
        req.log.debug('post kastes preferences', req.body);
        const username = req.session?.user?.username || '';
        const preferences = req.body;
        res.json(
            await UsersDAO.updateUserPreferences(username, 'kastes', preferences)
        );
    }

    @Post('label')
    private async setLabel(req: Request, res: Response) {
        const pasutijumsId = +(req.query.pasutijumsId || 0);
        const kods = req.body.kods;
        req.log.info('set kastes label', { pasutijumsId, kods });
        res.json(
            await KastesDAO.setLabel(pasutijumsId, kods)
        );
    }

    @Post('veikali')
    private async updateVeikali(req: Request, res: Response) {
        const { veikali } = req.body as { veikali: Veikals[]; };
        if (!veikali) { throw new Error('invalid data'); }
        res.json(
            await KastesDAO.updateVeikali(veikali)
        );
    }

    @Post(':id/:kaste/gatavs/:yesno')
    private async setGatavs(req: Request, res: Response) {
        const params = {
            id: new ObjectId(req.params.id as string),
            kaste: +req.params.kaste,
            yesno: +req.params.yesno ? true : false,
        };
        req.log.info('post gatavs', params);
        // const { field, id, kaste, yesno } = req.body;
        res.json(
            await KastesDAO.setGatavs(params)
        );
    }

    @Get('preferences')
    private async getPreferences(req: Request, res: Response) {
        const username = req.session?.user?.username || '';
        res.json(
            await UsersDAO.getUserPreferences(username, 'kastes')
        );
    }

    @Get('apjomi')
    async getApjomi(req: Request, res: Response) {
        const pasutijumsId = +(req.query.pasutijumsId || 0);
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
        const pasutijumsId = +(req.query.pasutijumsId || 0);
        res.json(
            await KastesDAO.kastesList(pasutijumsId)
        );
    }

    @Delete('')
    private async deleteKastes(req: Request, res: Response) {
        if (!req.query.pasutijumsId || isNaN(+req.query.pasutijumsId)) {
            throw new Error('no jobId');
        }
        const pasutijumsId = +req.query.pasutijumsId;
        req.log.info('delete kastes requested', pasutijumsId);
        res.json(
            await KastesDAO.deleteKastes(pasutijumsId)
        );
    }

}
