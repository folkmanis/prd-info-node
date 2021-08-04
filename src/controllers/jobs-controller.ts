import { ClassErrorMiddleware, ClassMiddleware, ClassWrapper, Controller, Get, Middleware, Post, Put } from '@overnightjs/core';
import Busboy from "busboy";
import { Request, Response } from 'express';
import { CountersDao, CustomersDao, FileSystemDao, JobsDao, ProductsDao, MessagesDao } from '../dao';
import {
    Customer, Job,
    JobQueryFilter,
    JobResponse, ProductNoPrices,
    ProductPriceImport,
    JobMessage,
} from '../interfaces';
import { asyncWrapper } from '../lib/asyncWrapper';
import { logError } from '../lib/errorMiddleware';
import { FolderPath } from '../lib/folder-path';
import { Preferences } from '../lib/preferences-handler';
import { PrdSession } from '../lib/session-handler';
import { JobsNotification } from '../interfaces';

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

    constructor(
        private countersDao: CountersDao,
        private jobsDao: JobsDao,
        private customersDao: CustomersDao,
        private fileSystem: FileSystemDao,
        private productsDao: ProductsDao,
    ) { }

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
        response.insertedCustomers = (await this.customersDao.insertCustomers(data.customers)).insertedCount || 0;
        response.insertedProducts = (await this.productsDao.insertNewProducts(data.products)).insertedCount || 0;
        response.insertedPrices = (await this.productsDao.addPrices(data.prices)).insertedCount || 0;
        response.insertedJobs = (await this.jobsDao.insertJobs(data.jobs)).insertedCount || 0;
        req.log.info('Imported documents', response);
        res.json(response);
    }

    @Post(':jobId/file')
    private async uploadFile(req: Request, res: Response) {
        const jobId = +req.params.jobId;
        /** jobId validity check */
        if (isNaN(jobId)) { throw new Error('Invalid jobId'); }

        const jb = await this.jobsDao.getJob(jobId);
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
            this.fileSystem.writeFile(file, path, fName);
        });
        busboy.on('finish', async () => {
            req.log.info('Upload complete', { jobId: job.jobId, path, filename });
            this.jobsDao.updateJob(
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
        const modifiedCount = await this.jobsDao.updateJob(jobId, job);
        res.json({
            error: false,
            modifiedCount,
        });
        // req.log.info(`Job ${jobId} updated`, { jobId, ...job });

        res.notification = new JobsNotification({ jobId, operation: 'update' });

        if (job.customer && job.products instanceof Array) {
            this.productsDao.touchProduct(job.customer, job.products.map(pr => pr.name));
        }
    }

    @Post('')
    async updateJobs(req: Request, res: Response) {
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
        const resp = await this.jobsDao.updateJobs(jobs);
        res.json({
            error: false,
            modifiedCount: resp
        });
        req.log.info('Jobs update', { jobs, modified: resp });

    }

    private async addFolderPathToJob<T extends Partial<Job>>(jobId: number, job: T): Promise<T & Pick<Job, 'files'>> {
        const jb = await this.jobsDao.getJob(jobId);
        if (!jb) { throw 'No Job'; }
        const { code } = await this.customersDao.getCustomer(jb.customer) as Customer;
        const path = FolderPath.toArray({
            ...jb,
            custCode: code
        });
        await this.fileSystem.createFolder(path);

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
            let ids = (await this.countersDao.getNextId('lastJobId', job.length)) - job.length;
            res.json(
                await this.jobsDao.insertJobs(
                    job.map(jb => ({
                        ...jb,
                        receivedDate: new Date(jb.receivedDate || Date.now()),
                        jobId: ids++,
                    }))
                )
            );
        } else {
            job.receivedDate = new Date(req.body.receivedDate || Date.now());
            job.jobId = await this.countersDao.getNextId('lastJobId');
            const { jobId } = await this.jobsDao.insertJob(job);
            if (req.query.createFolder === 'true') {

                const jobPath = await this.addFolderPathToJob(jobId, {});
                await this.fileSystem.createFolder(jobPath.files!.path);


                await this.jobsDao.updateJob(
                    jobId,
                    jobPath
                );
            }
            res.json({
                error: false,
                insertedId: jobId,
            });
            if (job.customer && job.products instanceof Array) {
                this.productsDao.touchProduct(job.customer, job.products.map(pr => pr.name));
            }
        }
    }

    @Get('jobs-without-invoices-totals')
    private async getInvoicesTotals(req: Request, res: Response) {
        res.json(
            await this.jobsDao.jobsWithoutInvoiceTotals()
        );
    }

    @Get(':jobId')
    private async getJob(req: Request, res: Response) {
        const jobId = +req.params.jobId;
        if (isNaN(jobId)) { throw new Error('Invalid jobId'); }
        res.json({
            error: false,
            data: await this.jobsDao.getJob(jobId) || undefined,
        });
    }

    @Get('')
    private async getJobs(req: Request, res: Response) {
        res.json(
            await this.jobsDao.getJobs(req.query as JobQueryFilter)
        );
    }

}
