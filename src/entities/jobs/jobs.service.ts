import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FilterType } from '../../lib/start-limit-filter/filter-type.interface';
import { JobsCounterService } from './dao/counters.service';
import { JobsDao } from './dao/jobs-dao.service';
import { JobsInvoicesDao } from './dao/jobs-invoices-dao.service';
import { UpdateJobDto } from './dto/update-job.dto';
import { Production } from './entities/job-categories';
import { Job } from './entities/job.entity';
import { assertCondition } from '../../lib/assertions';

@Injectable()
export class JobsService {
  constructor(
    private readonly jobsDao: JobsDao,
    private readonly jobsInvoicesDao: JobsInvoicesDao,
    private readonly counters: JobsCounterService,
  ) { }

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

  async setProduction(jobsId: number[], production: Partial<Production>) {
    const update = Object.assign(
      {},
      ...Object.keys(production).map((key) => ({
        ['production.' + key]: production[key as keyof Production],
      })),
    );
    const jobsUpdate: UpdateJobDto[] = jobsId.map((jobId) => ({
      ...update,
      jobId,
    }));
    return this.jobsDao.updateJobs(jobsUpdate);
  }
}

