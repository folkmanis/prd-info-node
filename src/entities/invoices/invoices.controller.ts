import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Patch,
  Put,
  Query,
  Res,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { Modules } from '../../login/index.js';
import { JobsService } from '../jobs/jobs.service.js';
import { InvoicesDao } from './dao/invoices-dao.service.js';
import { InvoiceInsert } from './dto/invoice-insert.dto.js';
import { InvoiceUpdate } from './dto/invoice-update.dto.js';
import { InvoiceForReport } from './entities/invoice-for-report.interface.js';
import { InvoicesFilter } from './entities/invoice.entity.js';
import { invoicesReport } from './invoices-report/invoices-report.js';
import { InvoicesService } from './invoices.service.js';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor.js';

@Controller('invoices')
@Modules('jobs', 'calculations')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class InvoicesController {
  constructor(
    private readonly invoicesDao: InvoicesDao,
    private readonly jobsService: JobsService,
    private readonly invoicesService: InvoicesService,
  ) {}

  @Put('report')
  async prepareReport(@Body() invoice: InvoiceForReport, @Res() res: Response) {
    const pdf = invoicesReport(invoice);
    res.contentType('application/pdf');
    pdf.pipe(res);
    pdf.end();

    return {}; // not null response for interceptor
  }

  @Put('')
  async newInvoice(
    @Body() { jobIds, customerId }: InvoiceInsert,
  ): Promise<InvoiceForReport> {
    const invoiceId = await this.invoicesService.createInvoice({
      jobIds,
      customerId,
    });

    return this.invoicesService.invoiceForReport(invoiceId);
  }

  @Patch(':id')
  async updateInvoice(
    @Param('id') invoiceId: string,
    @Body() update: InvoiceUpdate,
  ) {
    return this.invoicesDao.updateInvoice(invoiceId, update);
  }

  @Delete(':id')
  @UseInterceptors(
    new ResponseWrapperInterceptor('deletedCount', { wrapZero: true }),
  )
  async deleteInvoice(@Param('id') invoiceId: string) {
    await this.jobsService.unsetInvoices(invoiceId);
    return this.invoicesDao.deleteInvoice(invoiceId);
  }

  @Get('totals')
  async getTotals(
    @Query('jobsId', new ParseArrayPipe({ items: Number })) jobsId: number[],
  ) {
    return this.jobsService.getJobsTotals(jobsId);
  }

  @Get('report_:invoiceId.pdf')
  async getInvoiceReport(
    @Param('invoiceId') invoiceId: string,
    @Res() res: Response,
  ) {
    const data = await this.invoicesService.invoiceForReport(invoiceId);
    const pdf = invoicesReport(data);

    res.contentType('application/pdf');
    pdf.pipe(res);
    pdf.end();

    return {}; // not null response for interceptor
  }

  @Get(':invoiceId')
  async getInvoice(@Param('invoiceId') invoiceId: string) {
    return this.invoicesService.invoiceForReport(invoiceId);
  }

  @Get('')
  async getInvoices(@Query('customer') customer?: string) {
    const filter: InvoicesFilter = {};
    if (customer) {
      filter.customer = customer;
    }
    return this.invoicesDao.getAll(filter);
  }
}
