/*
data/kastes/

GET pasnames
pasūtījumu saraksts
{ _id: ObjectId, pasutijums: string }

POST addpasutijums
pievieno pasūtījumu
req.body = { pasutijums: string }
res = {_id: ObjectId | null}

POST table
Saraksts ar veikalu kastēm

GET numbers
pasutijums: string pasūtījuma id
total?: number kopējais skaits kastē

GET preferences
sesijas lietotāja privētie iestatījumi modulim 'kastes'

POST preferences
sesijas lietotāja moduļa 'kastes' iestatījumu iestatīšana
body.preferences: {key: value}

POST gatavs
atzīmē kastes lauku kā gatavu
{ field, id, kaste, yesno } = req.body

*/

import { Controller, ClassMiddleware, Post, ClassWrapper, Get, Delete } from '@overnightjs/core';
import { Request, Response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import PrdSession from '../lib/session-handler';
import Preferences from '../lib/preferences-handler';
import { KastesDAO } from '../dao/kastesDAO';
import { UsersDAO } from '../dao/usersDAO';
import { ObjectId } from 'mongodb';
import { KastesVeikals, KastesPasutijums } from '../interfaces';

@Controller('data/kastes')
@ClassMiddleware([
    Preferences.getUserPreferences,
    PrdSession.validateSession,
    PrdSession.validateModule('kastes')
])
@ClassWrapper(asyncWrapper)
export class KastesController {

    @Get('pasnames')
    private async pasnames(req: Request, res: Response) {
        res.json(
            await KastesDAO.pasNames()
        );
    }

    @Post('addpasutijums')
    private async addpasutijums(req: Request, res: Response) {
        res.json(
            await KastesDAO.pasutijumsAdd(req.body.pasutijums as string)
        );
    }

    @Post('updatepasutijums')
    private async updatePasutijums(req: Request, res: Response) {
        const id = new ObjectId(req.body.pasutijums._id);
        const pas = req.body.pasutijums as KastesPasutijums;
        delete pas._id;
        if (!id || !pas) { res.json({}); }
        res.json(
            await KastesDAO.pasutijumsUpdate(id, pas)
        );
    }

    @Delete('pasutijums-cleanup')
    private async pasCleanup(req: Request, res: Response) {
        res.json(
            await KastesDAO.pasutijumiCleanup()
        );
    }

    @Get('kastes')
    private async getKastes(req: Request, res: Response) {
        req.log.debug('get kastes', req.query);
        const apjoms = req.query.apjoms ? +req.query.apjoms : undefined;
        res.json(
            await KastesDAO.kastesList(new ObjectId(req.query.pasutijums as string), apjoms)
        );
    }

    @Get('kaste')
    private async getKaste(req: Request, res: Response) {
        const kaste = req.query.kaste ? +req.query.kaste : 0;
        const id = req.query.id;
        res.json(
            await KastesDAO.getKaste(new ObjectId(id as string), kaste)
        );
    }

    @Get('totals')
    private async getTotals(req: Request, res: Response) {
        const pas = new ObjectId(<string>req.query.pasutijums);
        res.json(
            await KastesDAO.veikaliTotals(pas)
        );
    }

    @Get('totals-kastes')
    private async getTotalsAndKastes(req: Request, res: Response) {
        const pas = new ObjectId(<string>req.query.pasutijums);
        res.json(
            {
                totals: await KastesDAO.veikaliTotals(pas),
                kastes: await KastesDAO.kastesList(pas)
            }
        );
    }

    @Post('gatavs')
    private async setGatavs(req: Request, res: Response) {
        req.log.debug('post gatavs', req.body);
        const { field, id, kaste, yesno } = req.body;
        res.json(
            await KastesDAO.setGatavs(field, new ObjectId(id), kaste, yesno)
        );
    }

    @Post('table')
    private async table(req: Request, res: Response) {
        const veikali = req.body.veikali as KastesVeikals[];
        req.log.debug('post table', veikali);
        const count = await KastesDAO.veikaliAdd(veikali.map(vk => ({ ...vk, pasutijums: new ObjectId(vk.pasutijums) })));
        res.json({ affectedRows: count || 0 });
    }

    @Get('preferences')
    private async getPreferences(req: Request, res: Response) {
        const username = req.session?.user.username || '';
        res.json(
            await UsersDAO.getUserPreferences(username, 'kastes')
        );
    }

    @Post('preferences')
    private async postPreferences(req: Request, res: Response) {
        req.log.debug('post kastes preferences', req.body);
        const username = req.session?.user.username || '';
        const preferences = req.body.preferences;
        res.json(
            await UsersDAO.updateUserPreferences(username, 'kastes', preferences)
        );
    }

}
