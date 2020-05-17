import { Controller, ClassMiddleware, Post, ClassWrapper, Middleware, Get, Delete, Put, ClassErrorMiddleware } from '@overnightjs/core';
import { Request, Response, response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import { logError } from '../lib/errorMiddleware';
import PrdSession from '../lib/session-handler';
import Preferences from '../lib/preferences-handler';
import { ObjectId } from 'mongodb';
import { Job, JobQueryFilter, JobResponse } from '../lib/job.class';
import { InvoicesFilter } from '../lib/invoice.class';
import { Customer } from '../lib/customers-interface';
import { ProductNoPrices, ProductPriceImport } from '../lib/products-interface';
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
        delete job._id;
        delete job.jobId;
        res.json(
            await jobsDAO.updateJob(jobId, job)
        );
    }

    @Put('')
    private async newJob(req: Request, res: Response) {
        const job = req.body as Job;
        delete job.jobId;
        job.receivedDate = new Date(req.body.receivedDate || Date.now());
        job.jobId = await PreferencesDAO.getNextJobId();
        res.json(
            await jobsDAO.insertJob(req.body)
        );
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
