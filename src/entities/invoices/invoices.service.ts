import { Injectable } from '@nestjs/common';
import { InvoicesDao } from './dao/invoices-dao.service';
import { CustomersService } from '../customers/customers.service';
import { InvoiceForReport } from './entities/invoice-for-report.interface';
import { InvoiceInsert } from './dto/invoice-insert.dto';
import { InvoicesCounterService } from './dao/counter.service';
import { JobsService } from '../jobs/jobs.service';
import { ObjectId } from 'mongodb';

@Injectable()
export class InvoicesService {

    constructor(
        private readonly invoicesDao: InvoicesDao,
        private readonly customersService: CustomersService,
        private readonly counterService: InvoicesCounterService,
        private readonly jobsService: JobsService,
    ) { }

    async createInvoice({ jobIds, customerId }: InvoiceInsert): Promise<string> {

        const invoiceId = await this.counterService.getNextInvoiceId();
        const jobsId = await this.jobsService.setInvoice(jobIds, customerId, invoiceId);
        const products = await this.jobsService.getInvoiceTotals(invoiceId);

        await this.invoicesDao.insertOne({
            _id: new ObjectId,
            invoiceId,
            customer: customerId,
            createdDate: new Date(Date.now()),
            jobsId,
            products,
        });

        return invoiceId;

    }

    async invoiceForReport(
        id: string,
    ): Promise<InvoiceForReport> {
        const data = await this.invoicesDao.getOne(id);
        const customerInfo = await this.customersService.getCustomerByName(data.customer);
        return {
            ...data,
            customerInfo,
            total: data.products.reduce((acc, curr) => acc + curr.total, 0),
        };
    }


}
