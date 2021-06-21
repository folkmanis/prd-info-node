import { Controller, ClassMiddleware, Post, ClassWrapper, Middleware, Get, Delete, Put, ClassErrorMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import { logError } from '../lib/errorMiddleware';
import { PrdSession } from '../lib/session-handler';
import { Preferences } from '../lib/preferences-handler';
import { InvoicesFilter, InvoiceUpdate, INVOICE_UPDATE_FIELDS } from '../interfaces';
import { invoicesDAO, customersDAO, jobsDAO } from '../dao';
import { pick } from '../lib/pick';
import { CountersDAO } from '../dao-next/countersDAO';

@Controller('data/invoices')
@ClassErrorMiddleware(logError)
@ClassMiddleware([
    Preferences.getUserPreferences,
    PrdSession.validateSession,
    PrdSession.validateModule('jobs'),
])
@ClassWrapper(asyncWrapper)
export class InvoicesController {

    constructor(
        private countersDao: CountersDAO,
    ) { }

    @Put('')
    private async newInvoice(req: Request, res: Response) {
        const jobIds: number[] = req.body.selectedJobs;
        const customerId: string = req.body.customerId;
        const invoiceId = (await this.countersDao.getNextId('lastInvoiceId')).toString().padStart(5, '0');
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

    @Post(':id')
    private async updateInvoice(req: Request, res: Response) {
        const id: string = req.params.id;
        const update: InvoiceUpdate = pick(req.body, INVOICE_UPDATE_FIELDS);
        res.json({
            error: false,
            modifiedCount: await invoicesDAO.updateInvoice(id, update),
        });
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
        const id: string = req.params.invoiceId;
        const data = await invoicesDAO.getInvoice(id);
        const customerInfo = data && await customersDAO.getCustomer(data.customer);
        // if (!customerInfo) { throw new Error('No data'); }

        res.json({
            error: false,
            data: data ? { ...data, customerInfo } : undefined
        });
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