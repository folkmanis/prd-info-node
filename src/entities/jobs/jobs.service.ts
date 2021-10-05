import { Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { FilesystemService, FolderPathService } from '../../filesystem';
import { FilterType } from '../../lib/start-limit-filter/filter-type.interface';
import { CustomersService } from '../customers/customers.service';
import { JobsCounterService } from './dao/counters.service';
import { JobsDao } from './dao/jobs-dao.service';
import { JobsInvoicesDao } from './dao/jobs-invoices-dao.service';
import { UpdateJobDto } from './dto/update-job.dto';
import { Production } from './entities/job-categories';
import { Job } from './entities/job.entity';

@Injectable()
export class JobsService {

  constructor(
    private readonly jobsDao: JobsDao,
    private readonly jobsInvoicesDao: JobsInvoicesDao,
    private readonly customersService: CustomersService,
    private readonly folderPathService: FolderPathService,
    private readonly filesystemService: FilesystemService,
    private readonly counters: JobsCounterService,
  ) { }

  async getAll(filter: FilterType<Job>, unwindProducts: boolean): Promise<Job[]> {
    return this.jobsDao.getAll(filter, unwindProducts);
  }

  async getOne(jobId: number): Promise<Job | null> {
    return this.jobsDao.getOne(jobId);
  }

  async addFolderPathToJob(jobId: number): Promise<Job | undefined> {

    const job = await this.jobsDao.getOne(jobId);
    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }
    if (job.files?.path) {
      return job;
    }

    const { code } = await this.customersService.getCustomerByName(
      job.customer,
    );

    const path = this.folderPathService.jobToPath({
      ...job,
      custCode: code,
    });
    await this.filesystemService.createFolder(path);

    return this.jobsDao.updateJob({
      jobId: job.jobId,
      files: {
        ...job.files,
        path
      }
    });

  }

  async writeJobFile({ jobId, files }: Job, req: Request): Promise<Job | undefined> {
    let fileNames = files?.fileNames || [];
    const path = files?.path!;
    fileNames = await this.filesystemService.writeFormFile(path, req, fileNames);
    return this.jobsDao.updateJob({
      jobId,
      files: {
        path,
        fileNames: fileNames,
      }
    });
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
    const update = Object.assign({}, ...Object.keys(production).map((key) => ({ ['production.' + key]: production[key as keyof Production] })));
    const jobsUpdate: UpdateJobDto[] = jobsId.map(jobId => ({ ...update, jobId }));
    return this.jobsDao.updateJobs(jobsUpdate);
  }
}
