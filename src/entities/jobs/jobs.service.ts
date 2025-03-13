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

@Injectable()
export class JobsService {
  constructor(
    private readonly jobsDao: JobsDao,
    private readonly jobsInvoicesDao: JobsInvoicesDao,
    private readonly jobsMaterialsDao: JobsMaterialsDaoService,
    private readonly counters: JobsCounterService,
  ) {}

  async getAll(
    filter: FilterType<Job>,
    unwindProducts: boolean,
  ): Promise<Job[]> {
    return this.jobsDao.getAll(filter, unwindProducts);
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
}
