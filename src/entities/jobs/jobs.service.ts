import { Injectable } from '@nestjs/common';
import { FilterType } from '../../lib/start-limit-filter/filter-type.interface.js';
import { JobsCounterService } from './dao/counters.service.js';
import { JobsDao } from './dao/jobs-dao.service.js';
import { JobsInvoicesDao } from './dao/jobs-invoices-dao.service.js';
import { UpdateJobDto } from './dto/update-job.dto.js';
import { Job } from './entities/job.entity.js';
import { assertCondition } from '../../lib/assertions.js';
import { JobsMaterialsDaoService } from './dao/jobs-materials-dao.service.js';
import { JobMaterialsSummaryQuery } from './dto/job-materials-summary.query.js';
import { ProductsQuery } from './dto/products-query.js';
import { JobsProductsDaoService } from './dao/jobs-products-dao.service.js';
import { jobProductsReport } from './job-products-report/job-products-report.js';
import { JobQuery } from './dto/job-query.js';
import { TCreatedPdf } from 'pdfmake';
import { jobsReport } from './jobs-report/jobs-report.js';
import { PreferencesService } from '../../preferences/preferences.service.js';
import { JobsSystemPreference } from '../../preferences/interfaces/system-preferences.interface.js';
import { JobOneProduct } from './entities/job-one-product.js';

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

  async getAll<
    K extends boolean,
    Result = K extends true ? JobOneProduct : Job,
  >(filter: FilterType<Job>, unwindProducts: K): Promise<Result[]> {
    return this.jobsDao.getAll(filter, unwindProducts);
  }

  async getJobsReport(query: JobQuery): Promise<TCreatedPdf> {
    const { filter } = query.toFilter();

    const totals = await this.jobsProductsDao.getProductsTotals({ filter });
    const jobs = await this.jobsDao.getAll(
      { filter, limit: 0, start: 0 },
      true,
      {
        jobId: 1,
      },
    );

    const preferences = await this.getPreferences();

    return jobsReport(query, jobs as JobOneProduct[], totals, preferences);
  }

  async getCount(
    filter: FilterType<Job>,
    unwindProducts: boolean,
  ): Promise<number> {
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

  async getInvoiceTotals(invoiceId: string) {
    return this.jobsInvoicesDao.getInvoiceTotals(invoiceId);
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

  private async getPreferences(): Promise<JobsSystemPreference> {
    return this.preferencesService.getModuleSystemPreferences(
      'jobs',
    ) as Promise<JobsSystemPreference>;
  }
}
