/**
 * data/xmf-search/search?q=<string>&customers=<>&year=<>&date=<>
 * { count: number, data: {
 *          JDFJobID,
            DescriptiveName,
            CustomerName,
            "Archives.Location",
            "Archives.Date",
            "Archives.Action",
   }[] }
 *
 * data/xmf-search/facet?q=<string>&customers=<>&year=<>&date=<>
 * 
 *  customerName: Count[],
    year: Count[],
    month: Count[],

 */

import { Controller, ClassMiddleware, Get, Post, Wrapper, ClassWrapper } from '@overnightjs/core';
import { Request, Response } from 'express';
import { ArchiveSearchParams } from '../lib/xmf-archive-class';
import { asyncWrapper } from '../lib/asyncWrapper';
import PrdSession from '../lib/session-handler';
import Preferences from '../lib/preferences-handler';
import { UserPreferences } from '../lib/user-class';
import { xmfSearchDAO } from '../dao/xmf-searchDAO';

@Controller('data/xmf-search')
@ClassMiddleware([Preferences.getUserPreferences, PrdSession.validateSession, PrdSession.validateModule('xmf-search')])
@ClassWrapper(asyncWrapper)
export class XmfSearchController {

    @Get('search')
    private async search(req: Request, res: Response) {
        req.log.info("query", JSON.parse(req.query.query));
        if (!req.query.query) { // ja nav jautājums
            res.json({ count: 0, data: [] }); // skaits 0
            return;
        }
        res.json(
            await xmfSearchDAO.findJob(JSON.parse(req.query.query) as ArchiveSearchParams, req.userPreferences as UserPreferences)
        );
    }

    @Get('customers')
    private async getCustomers(req: Request, res: Response) {
        req.log.debug('xmfserach customers');
        res.json(await xmfSearchDAO.getCustomers());
    }

}
