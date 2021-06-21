import {
    Controller, ClassMiddleware,
    Post, Put, Get, Delete,
    ClassWrapper, ClassErrorMiddleware
} from '@overnightjs/core';
import { Request, Response } from 'express';
import { ObjectId, Timestamp } from 'mongodb';
import { asyncWrapper } from '../lib/asyncWrapper';
import { PrdSession } from '../lib/session-handler';
import { Preferences } from '../lib/preferences-handler';
import { KastesDAO } from '../dao/kastesDAO';
import { jobsDAO } from '../dao/jobsDAO';
import { Veikals, KastesJob, Colors, KastesJobResponse, Product, JobProduct, ColorTotals } from '../interfaces';
import { logError } from '../lib/errorMiddleware';

@Controller('data/kastes-orders')
@ClassErrorMiddleware(logError)
@ClassMiddleware([
    Preferences.getUserPreferences,
    PrdSession.validateSession,
    PrdSession.validateModule('kastes')
])
@ClassWrapper(asyncWrapper)
export class KastesOrderController {

    @Get(':id')
    private async getOrder(req: Request, res: Response) {
        const jobId = +req.params.id;
        const result: Promise<KastesJobResponse> = Promise.all([
            jobsDAO.getJob(jobId),
            KastesDAO.colorTotals(jobId),
            KastesDAO.apjomiTotals(jobId),
            KastesDAO.veikali(jobId),
        ])
            .then(([job, colorTotals, apjomiTotals, veikali]) => ({
                error: false,
                data: job ? {
                    ...job,
                    category: 'perforated paper',
                    isLocked: false,
                    apjomsPlanned: job.products instanceof Array ? productsTocolorTotals(job.products) : [],
                    totals: {
                        veikali: veikali.length,
                        colorTotals,
                        apjomiTotals,
                    },
                    veikali,
                } : undefined
            }));
        res.json(
            await result
        );
    }

    @Get('')
    async getKastesJobs(req: Request, res: Response) {
        const veikali: boolean = req.query.veikali === '1';
        res.json(
            await jobsDAO.getKastesJobs(veikali)
        );
    }


    @Post(':id')
    private async updatePasutijums(req: Request, res: Response) {
        const jobId = +req.params.id;
        if (isNaN(jobId)) { throw new Error('jobId not provided'); }
        const pas = req.body as Partial<KastesJob>;
        delete pas.jobId;
        res.json({
            error: false,
            modifiedCount: await jobsDAO.updateJob(jobId, pas)
        });
    }

}

function productsTocolorTotals(products: JobProduct[]): ColorTotals[] {
    const colors: string[] = ['rose', 'white', 'yellow'];
    return products
        .filter(prod => colors.indexOf(prod.name) > -1)
        .map(prod => ({ color: prod.name as Colors, total: prod.count }));
}
