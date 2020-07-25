import { Controller, ClassMiddleware, Post, ClassWrapper, Middleware, Get, Delete, Put, ClassErrorMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import { logError } from '../lib/errorMiddleware';
import PrdSession from '../lib/session-handler';
import Preferences from '../lib/preferences-handler';
import {
    Job,
    JobQueryFilter,
    JobResponse,
    Customer,
    ProductNoPrices,
    ProductPriceImport
} from '../interfaces';
import { invoicesDAO, PreferencesDAO, jobsDAO, customersDAO, productsDAO } from '../dao';

class JobImportResponse implements JobResponse {
    insertedCustomers = 0;
    insertedProducts = 0;
    insertedPrices = 0;
    insertedJobs = 0;
    error = null;
}

@Controller('data/jobs')
@ClassErrorMiddleware(logError)
@ClassMiddleware([
    Preferences.getUserPreferences,
    PrdSession.validateSession,
    PrdSession.validateModule('jobs'),
])
@ClassWrapper(asyncWrapper)
export class JobsController {

    @Middleware(PrdSession.validateModule('jobs-admin'))
    @Post('jobimport')
    private async jobsImport(req: Request, res: Response) {
        const data: {
            customers: Customer[],
            products: ProductNoPrices[],
            prices: ProductPriceImport[],
            jobs: Job[],
        } = { ...req.body };
        const response = new JobImportResponse();
        response.insertedCustomers = (await customersDAO.insertCustomers(data.customers)).insertedCount || 0;
        response.insertedProducts = (await productsDAO.insertNewProducts(data.products)).insertedCount || 0;
        response.insertedPrices = (await productsDAO.addPrices(data.prices)).insertedCount || 0;
        response.insertedJobs = (await jobsDAO.insertJobs(data.jobs)).insertedCount || 0;
        req.log.info('Imported documents', response);
        res.json(response);
    }

    @Post(':jobId')
    private async updateJob(req: Request, res: Response) {
        const jobId = +req.params.jobId;
        const job = req.body as Partial<Job>;
        req.log.info(`Job ${jobId} updated`, { jobId, ...job });
        delete job._id;
        delete job.jobId;
        res.json(
            await jobsDAO.updateJob(jobId, job)
        );
        if (job.customer && job.products instanceof Array) {
            productsDAO.touchProduct(job.customer, job.products.map(pr => pr.name));
        }
}

    @Put('')
    private async newJob(req: Request, res: Response) {
        const job = req.body as Job | Job[];
        if (job instanceof Array) {
            let ids = (await PreferencesDAO.getNextJobId(job.length)) - job.length;
            res.json(
                await jobsDAO.insertJobs(
                    job.map(jb => ({
                        ...jb,
                        receivedDate: new Date(jb.receivedDate || Date.now()),
                        jobId: ids++,
                    }))
                )
            );
        } else {
            job.receivedDate = new Date(req.body.receivedDate || Date.now());
            job.jobId = await PreferencesDAO.getNextJobId();
            res.json(
                await jobsDAO.insertJob(job)
            );
            if (job.customer && job.products instanceof Array) {
                productsDAO.touchProduct(job.customer, job.products.map(pr => pr.name));
            }
        }
        req.log.info('Job inserted', job);
    }

    @Get(':jobId')
    private async getJob(req: Request, res: Response) {
        const jobId = +req.params.jobId;
        if (isNaN(jobId)) { throw new Error('Invalid jobId'); }
        res.json(
            await jobsDAO.getJob(jobId)
        );
    }

    @Get('')
    private async getJobs(req: Request, res: Response) {
        res.json(
            await jobsDAO.getJobs(req.query as JobQueryFilter)
        );
    }

}
