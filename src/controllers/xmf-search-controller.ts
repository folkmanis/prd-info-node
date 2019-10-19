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

    @Get(':query')
    private async search(req: Request, res: Response) {
        const q = req.query.query;
        if (q.length < 3) {
            Logger.Info('Search too short');
            res.json({});
            return;
        }
        const qqq = `SELECT jobs_new.*, records_new.Location, records_new.Date, actions.Action FROM jobs_new
        LEFT JOIN records_new ON jobs_new.id = records_new.id
        LEFT JOIN actions ON records_new.Action = actions.id
        WHERE (jobs_new.DescriptiveName LIKE '%${q}%')
        OR (jobs_new.JDFJobID LIKE '%${q}%')
        ORDER BY jobs_new.JobID, jobs_new.id DESC;`;
        
        const result = await asyncQuery(req.sqlConnection, qqq);
        res.json(result);
    }

}
