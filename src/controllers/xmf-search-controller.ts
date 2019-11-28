/**
 * data/xmf-search/search?q=<string>&customers=<>
 * { count: number, data: {
 *          JDFJobID,
            DescriptiveName,
            CustomerName,
            "Archives.Location",
            "Archives.Date",
            "Archives.Action",
   }[] }
 */

import { Controller, ClassMiddleware, Get, Post, Wrapper, ClassWrapper } from '@overnightjs/core';
import { Request, Response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import PrdSession from '../lib/session-handler';
import xmfSearchDAO from '../dao/xmf-searchDAO';

@Controller('data/xmf-search')
@ClassMiddleware(PrdSession.validateSession)
@ClassWrapper(asyncWrapper)
export class XmfSearchController {

    @Get('search')
    private async search(req: Request, res: Response) {

        const q: string = req.query.q.trim() || null;
        if (!q) { // ja nav jautājums
            res.json({ count: 0 }); // skaits 0
        }

        res.json(
            await xmfSearchDAO.findJob(q, req.query.customers || undefined)
        );
    }

}
