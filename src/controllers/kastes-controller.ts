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

*/

import { Controller, ClassMiddleware, Post, ClassWrapper, Get, Delete } from '@overnightjs/core';
import { Request, Response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import PrdSession from '../lib/session-handler';
import Preferences from '../lib/preferences-handler';
import kastesDAO from '../dao/kastesDAO';
import usersDAO from '../dao/usersDAO';
import { ObjectId } from 'mongodb';
import { KastesVeikals } from '../lib/kastes-class';

@Controller('data/kastes')
@ClassMiddleware([Preferences.getUserPreferences, PrdSession.validateSession, PrdSession.validateModule('kastes')])
@ClassWrapper(asyncWrapper)
export class KastesController {

    @Get('pasnames')
    private async pasnames(req: Request, res: Response) {
        res.json(
            await kastesDAO.pasNames()
        );
    }

    @Post('addpasutijums')
    private async addpasutijums(req: Request, res: Response) {
        res.json(
            await kastesDAO.pasutijumsAdd(req.body.pasutijums as string)
        );
    }

    @Delete('pasutijums')
    private async deletePasutijums(req: Request, res: Response) {
        res.json(
            await kastesDAO.pasutijumsDelete(new ObjectId(req.query.id))
        );
    }

    @Get('numbers')
    private async getByNumbers(req: Request, res: Response) {
        res.json(
            await kastesDAO.veikaliList(new ObjectId(req.query.pasutijums), +req.query.total)
        );
    }

    @Post('table')
    private async table(req: Request, res: Response) {
        const veikali = req.body.veikali as KastesVeikals[];
        const count = await kastesDAO.veikaliAdd(veikali.map(vk => ({ ...vk, pasutijums: new ObjectId(vk.pasutijums) })));
        res.json({ affectedRows: count || 0 });
    }

    @Get('preferences')
    private async getPreferences(req: Request, res: Response) {
        const username = req.session?.user.username || '';
        res.json(
            await usersDAO.getUserPreferences(username, 'kastes')
        );
    }

    @Post('preferences')
    private async postPreferences(req: Request, res: Response) {
        const username = req.session?.user.username || '';
        const preferences = req.body.preferences;
        res.json(
            await usersDAO.updateUserPreferences(username, 'kastes', preferences)
        );
    }

}
