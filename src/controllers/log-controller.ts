/*
GET /data/log/entries
limit: 50 - ierakstu skaits
start: 0 - sākot no kura (jānaie pirmie)
level: number - minimālais svarīguma līmenis
dateTo: Date now() - datums līdz
dateFrom: Date 0 - datums no

GET /data/log/dates-groups
start - sākuma laiks YYYY-m-dTHH:MM:SS
end - beigu laiks YYYY-m-dTHH:MM:SS

_id: dienas YYYY-m-d

*/

import { Controller, Get, Post, Delete, Wrapper, ClassWrapper, ClassMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import PrdSession from '../lib/session-handler';
import { LoggerDAO } from '../dao/loggerDAO';

@Controller('data/log')
@ClassMiddleware(PrdSession.validateAdminSession)
@ClassWrapper(asyncWrapper)
export class LogController {

    @Get('entries')
    private async getEntries(req: Request, res: Response) {
        const query = req.query as {[key: string]: string};
        const params = {
            limit: +query.limit || 1000,
            start: +query.start || 0,
            level: +query.level || undefined,
            dateTo: query.dateTo ? new Date(query.dateTo) : new Date(Date.now()),
            dateFrom: query.dateFrom ? new Date(query.dateFrom) : new Date(0),
        };
        res.json(
            await LoggerDAO.read(params)
        );
        req.log.debug('Syslog retrieved', params);
    }

    @Get('infos')
    private async getInfos(req: Request, res: Response) {
        res.json(
            { data: await LoggerDAO.infos() }
        );
    }

    @Get('dates-groups')
    private async getDatesGroups(req: Request, res: Response) {
        res.json(
            { data: await LoggerDAO.datesGroup(req.query) }
        );
    }
}