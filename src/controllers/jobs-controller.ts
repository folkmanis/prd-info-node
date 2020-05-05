import { Controller, ClassMiddleware, Post, ClassWrapper, Middleware, Get, Delete, Put, ClassErrorMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import { logError } from '../lib/errorMiddleware';
import PrdSession from '../lib/session-handler';
import Preferences from '../lib/preferences-handler';
import { ObjectId } from 'mongodb';
import { Job, JobQueryFilter } from '../lib/job.class';
import { InvoicesFilter } from '../lib/invoice.class';
import { invoicesDAO, PreferencesDAO, jobsDAO } from '../dao';

@Controller('data/jobs')
@ClassErrorMiddleware(logError)
@ClassMiddleware([
    Preferences.getUserPreferences,
    PrdSession.validateSession,
    PrdSession.validateModule('jobs'),
])
@ClassWrapper(asyncWrapper)
export class JobsController {

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

    @Post('')
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
