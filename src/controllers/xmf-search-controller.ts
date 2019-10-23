/**
 * data/xmf-search/search?q=<string>
 */

import { Controller, ClassMiddleware, Get, Post, Wrapper, ClassWrapper } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import { Request, Response } from 'express';
import { asyncQuery, MysqlPool } from '../lib/mysql-connector';
import { asyncWrapper } from '../lib/asyncWrapper';
import { PrdSession } from '../lib/session-handler';

interface ArchiveRecord {
    count: number;
    data?: Array<{
        id: number,
        jdfJobId: string,
        descriptiveName: string,
        location: string,
        action: string,
        date: string,
    }>;
}


@Controller('data/xmf-search')
@ClassMiddleware(PrdSession.validateSession)
@ClassWrapper(asyncWrapper)
export class XmfSearchController {

    @Get('search')
    private async search(req: Request, res: Response) {
        Logger.Info('xmf search ' + req.query.q);
        if (req.query.q.length < 4) {
            Logger.Info('Search too short');
            res.json({ count: -1 });
            return;
        }
        const q = '%' + req.query.q.trim() + '%';
        const result: ArchiveRecord = { count: 0, data: [] };
        const c = await asyncQuery<{ count: number }[]>(req.sqlConnection,
            `SELECT COUNT(*) AS count FROM xmf_jobs
            WHERE (xmf_jobs.DescriptiveName LIKE ?)
            OR (xmf_jobs.JDFJobID LIKE ?)`,
            [q, q]);
        console.log(c);
        result.count = c[0].count;
        if (result.count === 0) {
            res.json(result);
            return;
        }
        const qqq = `SELECT
        xmf_jobs.id AS id,
        xmf_jobs.JDFJobID AS jdfJobId,
        xmf_jobs.DescriptiveName AS descriptiveName,
        xmf_records.Location AS location,
        xmf_records.Date AS date,
        xmf_actions.Action AS action
    FROM
        xmf_jobs
    LEFT JOIN
        xmf_records
    ON
        xmf_jobs.id = xmf_records.id
    LEFT JOIN
        xmf_actions
    ON
        xmf_records.Action = xmf_actions.id
    WHERE
        (
            xmf_jobs.DescriptiveName LIKE ?
        ) OR(xmf_jobs.JDFJobID LIKE ?)
    ORDER BY
        xmf_jobs.JobID,
        xmf_jobs.id
    DESC
    LIMIT 100`;

        result.data = await asyncQuery(req.sqlConnection, qqq, [q, q]);
        // console.log(result);
        res.json(result);
    }

}
