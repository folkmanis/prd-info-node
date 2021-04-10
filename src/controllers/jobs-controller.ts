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
    ProductPriceImport,
    JobBase
} from '../interfaces';
import { PreferencesDAO, jobsDAO, customersDAO, productsDAO, fileSystemDAO, countersDAO } from '../dao';
import { FolderPath } from '../lib/folder-path';

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

        const jb = await jobsDAO.getJob(jobId);
        /* Job validity check */
        if (!jb) { throw new Error('Job not found'); }
        let job = jb;
        if (!job.files?.path) {
            job = await this.addFolderPathToJob(jobId, job);
        }

        const busboy = new Busboy({ headers: req.headers });
        let filename: string;

        const path: string[] = job.files?.path || [];
        let fileNames = job.files?.fileNames || [];

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
        let job = req.body as Partial<Job>;
        if (req.query.createFolder) {
            job = await this.addFolderPathToJob(jobId, job);
        }
        delete job._id;
        delete job.jobId;

        res.json({
            error: false,
            modifiedCount: await jobsDAO.updateJob(jobId, job)
        });
        req.log.info(`Job ${jobId} updated`, { jobId, ...job });
        if (job.customer && job.products instanceof Array) {
            productsDAO.touchProduct(job.customer, job.products.map(pr => pr.name));
        }
    }

    @Post()
    private async updateJobs(req: Request, res: Response) {
        const jobs = req.body as Partial<Job>[];
        if (!(jobs instanceof Array)) { // data must be array
            throw new Error('Invalid data: data must be array');
        }
        jobs.forEach(job => {
            if (typeof job.jobId !== 'number') { // jobId not provided
                const err = 'Invalid data: jobId not provided';
                req.log.error(err, job);
                throw new Error(err);
            }
            if (job.products && !(job.products instanceof Array) && typeof job.productsIdx !== 'number') {
                const err = 'Invalid data: products must contain entire array or must be one element with index provided';
                req.log.error(err, job);
                throw new Error(err);
            }
        });
        res.json({
            error: false,
            modifiedCount: await jobsDAO.updateJobs(jobs)
        });
    }

    private async addFolderPathToJob<T extends Partial<Job>>(jobId: number, job: T): Promise<T> {
        const jb = await jobsDAO.getJob(jobId);
        if (!jb) { throw 'No Job'; }
        const { code } = await customersDAO.getCustomer(jb.customer) as Customer;
        const path = FolderPath.toArray({
            ...jb,
            custCode: code
        });
        return {
            ...job,
            files: {
                ...job?.files,
                path,
            }
        };
    }

    @Put('')
    private async newJob(req: Request, res: Response) {
        const job = req.body as Job | Job[];
        if (job instanceof Array) {
            let ids = (await countersDAO.getNextId('lastJobId', job.length)) - job.length;
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
            const createFolder = req.query.createFolder === 'true';
            job.jobId = await countersDAO.getNextId('lastJobId');
            const { jobId } = await jobsDAO.insertJob(job);
            console.log(createFolder);
            if (createFolder) {
                await jobsDAO.updateJob(
                    jobId,
                    await this.addFolderPathToJob(jobId, {})
                );
            }
            res.json({
                error: false,
                insertedId: jobId,
            });
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
