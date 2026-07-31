import { Injectable } from '@nestjs/common';
import { TCreatedPdf } from 'pdfmake';
import { assertCondition } from '../../lib/assertions.js';
import { JobsSettings } from '../../preferences/interfaces/module-settings/job-settings.js';
import { PreferencesService } from '../../preferences/preferences.service.js';
import { InvoiceProduct } from '../invoices/entities/invoice.entity.js';
import { JobsCounterService } from './dao/counters.service.js';
import { JobsDao } from './dao/jobs-dao.service.js';
import { JobsInvoicesDao } from './dao/jobs-invoices-dao.service.js';
import { JobsMaterialsDaoService } from './dao/jobs-materials-dao.service.js';
import { JobsProductsDaoService } from './dao/jobs-products-dao.service.js';
import { JobMaterialsSummaryQuery } from './dto/job-materials-summary.query.js';
import { JobFilter } from './dto/job-query.js';
import { ProductsQuery } from './dto/products-query.js';
import { UpdateJobDto } from './dto/update-job.dto.js';
import { JobOneProduct } from './entities/job-one-product.js';
import { Job } from './entities/job.entity.js';
import { jobProductsReport } from './job-products-report/job-products-report.js';
import { jobsReport } from './jobs-report/jobs-report.js';

@Injectable()
export class JobsService {
  constructor(
    private readonly jobsDao: JobsDao,
    private readonly jobsProductsDao: JobsProductsDaoService,
    private readonly jobsInvoicesDao: JobsInvoicesDao,
    private readonly jobsMaterialsDao: JobsMaterialsDaoService,
    private readonly counters: JobsCounterService,
    private readonly preferencesService: PreferencesService,
  ) {}

  async getAll({
    filter,
    start,
    limit,
    unwindProducts,
  }: JobFilter): Promise<
    typeof unwindProducts extends true ? JobOneProduct[] : Job[]
  > {
    return this.jobsDao.getAll(filter, unwindProducts, start, limit);
  }

  async getJobsReport(query: JobFilter): Promise<TCreatedPdf> {
    const { filter } = query.filter;

    const totals = await this.jobsProductsDao.getProductsTotals({ filter });
    const jobs = await this.jobsDao.getAll(filter, true, 0, 0, {
      jobId: 1,
    });

    const preferences = await this.getPreferences();

    return jobsReport(query, jobs, totals, preferences);
  }

  async getCount({ filter, unwindProducts }: JobFilter): Promise<number> {
    const result = await this.jobsDao.getCount(
      { ...filter, start: 0, limit: 0 },
      unwindProducts,
    );
    return result[0]?.count ?? 0;
  }

  async getOne(jobId: number): Promise<Job> {
    const job = await this.jobsDao.getOne(jobId);
    assertCondition(job, `Job ${jobId} not found`);
    return job;
  }

  async updateJob(jobUpdate: UpdateJobDto): Promise<Job> {
    const job = await this.jobsDao.updateJob(jobUpdate);
    assertCondition(job, `Job update failed`);
    return job;
  }

  async nexJobId(): Promise<number> {
    return this.counters.getNextJobId();
  }

  async setInvoice(jobIds: number[], invoiceId: string): Promise<number[]> {
    return this.jobsInvoicesDao.setInvoice(jobIds, invoiceId);
  }

  async getInvoiceTotals(
    invoiceId: string,
    params: { detailedJobs?: boolean } = {},
  ): Promise<InvoiceProduct[]> {
    if (params.detailedJobs) {
      return this.jobsInvoicesDao.getInvoiceTotalsForEachJob(invoiceId);
    } else {
      return this.jobsInvoicesDao.getInvoiceTotals(invoiceId);
    }
  }

  async unsetInvoices(invoiceId: string): Promise<number> {
    return this.jobsInvoicesDao.unsetInvoices(invoiceId);
  }

  async getJobsTotals(jobIds: number[]) {
    return this.jobsInvoicesDao.getJobsTotals(jobIds);
  }

  async getMaterialsTotals(query: JobMaterialsSummaryQuery) {
    return this.jobsMaterialsDao.getMaterialsTotals(query.toFilter());
  }

  async getJobProductsTotals(query: ProductsQuery) {
    return this.jobsProductsDao.getProductsTotals(query.toFilter(), query);
  }

  async getJobProductsReport(query: ProductsQuery) {
    const data = await this.jobsProductsDao.getProductsTotals(
      query.toFilter(),
      query,
    );
    return jobProductsReport(query, data);
  }

  private async getPreferences(): Promise<JobsSettings> {
    return this.preferencesService.getModulePreferences('jobs');
  }
}
