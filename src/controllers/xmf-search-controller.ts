/**
 * data/xmf-search/search?q=<string>
 */

import { Controller, ClassMiddleware, Get, Post, Wrapper, ClassWrapper } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import { Request, Response } from 'express';
import { asyncQuery, MysqlPool } from '../lib/mysql-connector';
import { asyncWrapper } from '../lib/asyncWrapper';
import { PrdSession } from '../lib/session-handler';

export interface ArchiveRecord {

}

@Controller('data/xmf-search')
@ClassMiddleware(PrdSession.validateSession)
@ClassWrapper(asyncWrapper)
export class XmfSearchController {

    @Get('search')
    private async search(req: Request, res: Response) {
        const q = req.query.q;
        Logger.Info('xmf search ' + q);
        if (q.length < 3) {
            Logger.Info('Search too short');
            res.json({});
            return;
        }
        const qqq = `SELECT xmf_jobs.*, xmf_records.Location, xmf_records.Date, xmf_actions.Action FROM xmf_jobs
        LEFT JOIN xmf_records ON xmf_jobs.id = xmf_records.id
        LEFT JOIN xmf_actions ON xmf_records.Action = xmf_actions.id
        WHERE (xmf_jobs.DescriptiveName LIKE '%${q}%')
        OR (xmf_jobs.JDFJobID LIKE '%${q}%')
        ORDER BY xmf_jobs.JobID, xmf_jobs.id ASC;`;
        
        const result = await asyncQuery(req.sqlConnection, qqq);
        res.json(result);
    }

}
