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

@Injectable()
export class JobsService {

  constructor(
    private readonly jobsDao: JobsDao,
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
    const fileNames = files?.fileNames || [];
    const path = files?.path!;
    const fileNamesUploaded: string[] = await this.filesystemService.writeFormFile(path, req);
    return this.jobsDao.updateJob({
      jobId,
      files: {
        path,
        fileNames: fileNames.concat(...fileNamesUploaded)
      }
    });
  }

  async nexJobId(): Promise<number> {
    return this.counters.getNextJobId();
  }

  // TODO
  async setInvoice(jobIds: number[], customerId: string, invoiceId: string): Promise<number[]> {
    return [];
  }

  // TODO
  async getInvoiceTotals(invoiceId: string): Promise<any[]> {
    return [];
  }

  // TODO
  async unsetInvoices(invoiceId: string): Promise<number> {
    return 0;
  }

  // TODO
  async getJobsTotals(jobsId: number[]) {
    return {};
  }
}
