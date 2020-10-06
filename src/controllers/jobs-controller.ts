import { Controller, ClassMiddleware, Post, ClassWrapper, Middleware, Get, Delete, Put, ClassErrorMiddleware } from '@overnightjs/core';
import Busboy from "busboy";
import { Request, Response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import { logError } from '../lib/errorMiddleware';
import { PrdSession } from '../lib/session-handler';
import { Preferences } from '../lib/preferences-handler';
import {
    Job,
    JobQueryFilter,
    JobResponse,
    Customer,
    ProductNoPrices,
    ProductPriceImport
} from '../interfaces';
import { invoicesDAO, PreferencesDAO, jobsDAO, customersDAO, productsDAO, fileSystemDAO } from '../dao';

class JobImportResponse implements JobResponse {
    insertedCustomers = 0;
    insertedProducts = 0;
    insertedPrices = 0;
    insertedJobs = 0;
    error = null;
}

@Controller('data/jobs')
@ClassMiddleware([
    Preferences.getUserPreferences,
    PrdSession.validateSession,
    PrdSession.validateModule('jobs'),
])
@ClassWrapper(asyncWrapper)
@ClassErrorMiddleware(logError)
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

    @Post(':jobId/file')
    private async uploadFile(req: Request, res: Response) {
        const jobId = +req.params.jobId;
        /** jobId validity check */
        if (isNaN(jobId)) { throw new Error('Invalid jobId'); }

        const job = await jobsDAO.getJob(jobId);
        /* Job validity check */
        if (!job) { throw new Error('Job not found'); }

        const busboy = new Busboy({ headers: req.headers });
        let filename: string;

        if (!job.files?.path) { throw new Error(`Path not set for the job ${job.jobId}`); }
        const path: string[] = job.files.path;
        let fileNames = job.files.fileNames || [];

        busboy.on('file', (_, file, fName) => {
            filename = fName;
            if (!fileNames.includes(fName)) {
                fileNames = [...fileNames, fName];
            }
            req.log.info('Upload started', { jobId: job.jobId, path, filename });
            fileSystemDAO.writeFile(file, path, fName);
        });
        busboy.on('finish', async () => {
            req.log.info('Upload complete', { jobId: job.jobId, path, filename });
            jobsDAO.updateJob(
                job.jobId,
                {
                    files: {
                        path,
                        fileNames,
                    }
                }
            );
            res.json({
                error: false,
                resp: 'file uploaded',
                file: filename,
                jobId: job.jobId,
            });
        });
        req.pipe(busboy);
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
    }

    @Get('jobs-without-invoices-totals')
    private async getInvoicesTotals(req: Request, res: Response) {
        res.json(
            await jobsDAO.jobsWithoutInvoiceTotals()
        );
    }

    @Get(':jobId')
    private async getJob(req: Request, res: Response) {
        const jobId = +req.params.jobId;
        if (isNaN(jobId)) { throw new Error('Invalid jobId'); }
        res.json({
            error: false,
            data: await jobsDAO.getJob(jobId) || undefined,
        });
    }

    @Get('')
    private async getJobs(req: Request, res: Response) {
        res.json(
            await jobsDAO.getJobs(req.query as JobQueryFilter)
        );
    }

}
