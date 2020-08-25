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

    &start - sākuma numurs (0 bāze)
    &limit - ierakstu skaits vienā porcijā
 */

import { Controller, ClassMiddleware, Get, Post, Wrapper, ClassWrapper } from '@overnightjs/core';
import { Request, Response } from 'express';
import { ArchiveSearchParams, UserPreferences } from '../interfaces';
import { asyncWrapper } from '../lib/asyncWrapper';
import { PrdSession } from '../lib/session-handler';
import { Preferences } from '../lib/preferences-handler';
import { xmfSearchDAO } from '../dao/xmf-searchDAO';

@Controller('data/xmf-search')
@ClassMiddleware([Preferences.getUserPreferences, PrdSession.validateSession, PrdSession.validateModule('xmf-search')])
@ClassWrapper(asyncWrapper)
export class XmfSearchController {

    @Get('search')
    private async search(req: Request, res: Response) {
        const query = req.query.query ? JSON.parse(req.query.query as string) : {};
        query.q && query.q.length > 0 && req.log.info("XMF search");
        res.json(
            await xmfSearchDAO.findJobs(query as ArchiveSearchParams, req.userPreferences as UserPreferences, req.query.start as string, req.query.limit as string | undefined)
        );
    }

    @Get('customers')
    private async getCustomers(req: Request, res: Response) {
        req.log.debug('xmfserach customers');
        res.json(await xmfSearchDAO.getCustomers());
    }

}
