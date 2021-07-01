import { ClassErrorMiddleware, ClassMiddleware, ClassWrapper, Controller, Get, Post, Put } from '@overnightjs/core';
import { Request, Response } from 'express';
import { CountersDao, CustomersDao, InvoicesDao, JobsDao } from '../dao';
import { InvoicesFilter, InvoiceUpdate, INVOICE_UPDATE_FIELDS } from '../interfaces';
import { asyncWrapper } from '../lib/asyncWrapper';
import { logError } from '../lib/errorMiddleware';
import { pick } from '../lib/pick';
import { Preferences } from '../lib/preferences-handler';
import { PrdSession } from '../lib/session-handler';

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
        private jobsDao: JobsDao,
        private invoicesDao: InvoicesDao,
        private countersDao: CountersDao,
        private customersDao: CustomersDao,
    ) { }

    @Put('')
    private async newInvoice(req: Request, res: Response) {
        const jobIds: number[] = req.body.selectedJobs;
        const customerId: string = req.body.customerId;
        const invoiceId = (await this.countersDao.getNextId('lastInvoiceId')).toString().padStart(5, '0');
        const jobsId = await this.jobsDao.setInvoice(jobIds, customerId, invoiceId);
        const products = await this.jobsDao.getInvoiceTotals(invoiceId);
        res.json(
            await this.invoicesDao.insertInvoice(
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
            modifiedCount: await this.invoicesDao.updateInvoice(id, update),
        });
    }

    @Get('totals')
    private async getTotals(req: Request, res: Response) {
        const jobsId: number[] = (req.query.jobsId as string).split(',').map(val => +val);
        res.json(
            await this.jobsDao.getJobsTotals(jobsId)
        );
    }

    @Get(':invoiceId')
    private async getInvoice(req: Request, res: Response) {
        const id: string = req.params.invoiceId;
        const data = await this.invoicesDao.getInvoice(id);
        const customerInfo = data && await this.customersDao.getCustomer(data.customer);
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
            await this.invoicesDao.getInvoices(filter)
        );
    }

}