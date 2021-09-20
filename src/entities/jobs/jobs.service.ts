import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { CustomersService } from '../customers/customers.service';
import { JobsDao } from './dao/jobs-dao.service';
import { Job } from './entities/job.entity';
import { FolderPathService } from '../../filesystem';
import { FilesystemService } from '../../filesystem';
import { Request } from 'express';
import { JobsCounterService } from './dao/counters.service';
import { JobsInvoicesDao } from './dao/jobs-invoices-dao.service';

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


  async addFolderPathToJob(jobId: number): Promise<Job> {

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

  async writeJobFile({ jobId, files }: Job, req: Request): Promise<Job> {
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
}
