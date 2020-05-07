import { Controller, ClassMiddleware, Post, ClassWrapper, Middleware, Get, Delete, Put, ClassErrorMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import { logError } from '../lib/errorMiddleware';
import PrdSession from '../lib/session-handler';
import Preferences from '../lib/preferences-handler';
import { ObjectId, Logger } from 'mongodb';
import { Job, JobQueryFilter } from '../lib/job.class';
import { InvoicesFilter } from '../lib/invoice.class';
import { invoicesDAO, PreferencesDAO, jobsDAO } from '../dao';

@Controller('data/invoices')
@ClassErrorMiddleware(logError)
@ClassMiddleware([
    Preferences.getUserPreferences,
    PrdSession.validateSession,
    PrdSession.validateModule('jobs'),
])
@ClassWrapper(asyncWrapper)
export class InvoicesController {

    @Post('')
    private async newInvoice(req: Request, res: Response) {
        const jobIds: number[] = req.body.selectedJobs;
        const customerId: string = req.body.customerId;
        const invoiceId = await PreferencesDAO.getNextInvoiceId();
        const jobsId = await jobsDAO.setInvoice(jobIds, customerId, invoiceId);
        const products = await jobsDAO.getInvoiceTotals(invoiceId);
        res.json(
            await invoicesDAO.insertInvoice(
                {
                    invoiceId,
                    customer: customerId,
                    createdDate: new Date(Date.now()),
                    jobsId,
                    products,
                }
            )
        );
    }

    @Get('totals')
    private async getTotals(req: Request, res: Response) {
        const jobsId: number[] = (req.query.jobsId as string).split(',').map(val => +val);
        res.json(
            await jobsDAO.getJobsTotals(jobsId)
        );
    }

    @Get(':invoiceId')
    private async getInvoice(req: Request, res: Response) {
        res.json(
            await invoicesDAO.getInvoice(req.params.invoiceId as string)
        );
    }

    @Get('')
    private async getInvoices(req: Request, res: Response) {
        const filter: InvoicesFilter = {
            customer: req.query.customer as string
        };
        res.json(
            await invoicesDAO.getInvoices(filter)
        );
    }

}