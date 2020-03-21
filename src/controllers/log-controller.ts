/*
GET /data/log/entries
limit: 50 - ierakstu skaits
start: 0 - sākot no kura (jānaie pirmie)
level: number - minimālais svarīguma līmenis
dateTo: Date now() - datums līdz
dateFrom: Date 0 - datums no
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
        const query = req.query;
        const params = {
            limit: +query.limit || 50,
            start: +query.start || 0,
            level: +query.level || undefined,
            dateTo: query.dateTo ? new Date(query.dateTo) : new Date(Date.now()),
            dateFrom: query.dateFrom ? new Date(query.dateFrom) : new Date(0),
        };
        req.log.debug('Syslog retrieved', params);
        res.json(
            await LoggerDAO.read(params)
        );
    }
}