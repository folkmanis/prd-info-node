import { Injectable, NotFoundException } from '@nestjs/common';
import { assertNotNull } from '../../lib/assertions.js';
import { CustomersService } from '../customers/customers.service.js';
import { JobsService } from '../jobs/jobs.service.js';
import { InvoicesCounterService } from './dao/counter.service.js';
import { InvoicesDao } from './dao/invoices-dao.service.js';
import { InvoiceForList } from './dto/invoice-for-list.dto.js';
import { InvoiceForReport } from './dto/invoice-for-report.dto.js';
import { InvoiceInsert } from './dto/invoice-insert.dto.js';
import { InvoiceUpdate } from './dto/invoice-update.dto.js';
import { InvoicesFilter } from './dto/invoices-filter.dto.js';
import { Invoice } from './entities/invoice.entity.js';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly invoicesDao: InvoicesDao,
    private readonly customersService: CustomersService,
    private readonly counterService: InvoicesCounterService,
    private readonly jobsService: JobsService,
  ) {}

  async getInvoicesList(filter: InvoicesFilter): Promise<InvoiceForList[]> {
    return this.invoicesDao.getAll(filter);
  }

  async createInvoice({
    jobIds,
    customerId,
    detailedJobs,
  }: InvoiceInsert): Promise<InvoiceForReport> {
    const invoiceId = await this.counterService.getNextInvoiceId();
    const jobsId = await this.jobsService.setInvoice(jobIds, invoiceId);
    const products = await this.jobsService.getInvoiceTotals(invoiceId, {
      detailedJobs,
    });

    const invoice = {
      invoiceId,
      customer: customerId,
      createdDate: new Date(),
      jobsId,
      products,
    } as Invoice;

    const result = await this.invoicesDao.insertOne(invoice);
    assertNotNull(result, 'Failed to create invoice');

    return this.invoiceForReport(result.invoiceId);
  }

  async invoiceForReport(id: string): Promise<InvoiceForReport> {
    const data = await this.invoicesDao.getOne(id);
    const customerInfo = await this.customersService.getCustomerByName(
      data.customer,
    );
    return {
      ...data,
      customerInfo: customerInfo,
      total: data.products.reduce((acc, curr) => acc + curr.total, 0),
    };
  }

  async updateInvoice(
    invoiceId: string,
    update: InvoiceUpdate,
  ): Promise<InvoiceForReport> {
    const updated = await this.invoicesDao.updateInvoice(invoiceId, update);
    assertNotNull(updated);
    return this.invoiceForReport(updated.invoiceId);
  }

  async deleteInvoice(invoiceId: string): Promise<number> {
    await this.jobsService.unsetInvoices(invoiceId);
    const deletedCount = await this.invoicesDao.deleteInvoice(invoiceId);
    if (deletedCount === 0) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }
    return deletedCount;
  }
}
