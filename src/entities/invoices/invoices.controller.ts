import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { AllowNullResponse } from '../../lib/null-response.interceptor.js';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor.js';
import { Modules } from '../../login/index.js';
import { InvoiceInsertDto } from './dto/invoice-insert.dto.js';
import { InvoiceUpdateDto } from './dto/invoice-update.dto.js';
import {
  InvoiceForReport,
  InvoiceForReportDto,
} from './dto/invoice-for-report.dto.js';
import { invoicesReport } from './invoices-report/invoices-report.js';
import { InvoicesService } from './invoices.service.js';
import {
  InvoiceForList,
  InvoiceForListDto,
} from './dto/invoice-for-list.dto.js';
import { InvoicesFilterDto } from './dto/invoices-filter.dto.js';
import { ZodResponse } from 'nestjs-zod';

@Controller('invoices')
@Modules('jobs', 'calculations')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @AllowNullResponse()
  @Put('report')
  async prepareReport(
    @Body() invoice: InvoiceForReportDto,
    @Res() res: Response,
  ) {
    const pdf = await invoicesReport(invoice).getStream();
    res.contentType('application/pdf');
    pdf.pipe(res);
    pdf.end();
  }

  @ZodResponse({ type: InvoiceForReportDto })
  @Put('')
  async newInvoice(
    @Body() params: InvoiceInsertDto,
  ): Promise<InvoiceForReport> {
    return this.invoicesService.createInvoice(params);
  }

  @ZodResponse({ type: InvoiceForReportDto })
  @Patch(':id')
  async updateInvoice(
    @Param('id') invoiceId: string,
    @Body() update: InvoiceUpdateDto,
  ): Promise<InvoiceForReport> {
    return this.invoicesService.updateInvoice(invoiceId, update);
  }

  @Delete(':id')
  @UseInterceptors(new ResponseWrapperInterceptor('deletedCount'))
  async deleteInvoice(@Param('id') invoiceId: string) {
    return this.invoicesService.deleteInvoice(invoiceId);
  }

  @AllowNullResponse()
  @Get('report_:invoiceId.pdf')
  async getInvoiceReport(
    @Param('invoiceId') invoiceId: string,
    @Res() res: Response,
  ) {
    const data = await this.invoicesService.invoiceForReport(invoiceId);
    const pdf = await invoicesReport(data).getStream();

    res.contentType('application/pdf');
    pdf.pipe(res); // .end();
    pdf.end();
  }

  @ZodResponse({ type: InvoiceForReportDto })
  @Get(':invoiceId')
  async getInvoice(@Param('invoiceId') invoiceId: string) {
    return this.invoicesService.invoiceForReport(invoiceId);
  }

  @ZodResponse({ type: [InvoiceForListDto] })
  @Get('')
  async getInvoices(
    @Query() query: InvoicesFilterDto,
  ): Promise<InvoiceForList[]> {
    return this.invoicesService.getInvoicesList(query);
  }
}
