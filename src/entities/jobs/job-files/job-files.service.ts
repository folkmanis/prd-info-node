import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  JobFile,
  FileLocationTypes,
  FileLocation,
  FilesystemService,
} from '../../../filesystem/index.js';
import { JobsService } from '../jobs.service.js';
import { CustomersService } from '../../customers/customers.service.js';
import { Request } from 'express';
import { Job } from '../entities/job.entity.js';
import { last } from 'lodash-es';

@Injectable()
export class JobFilesService {
  private readonly logger = new Logger(JobFilesService.name);

  constructor(
    private readonly filesystemService: FilesystemService,
    private readonly jobsService: JobsService,
    private readonly customersService: CustomersService,
  ) { }

  async addFolderPathToJob(jobId: number): Promise<FileLocation> {
    const job = await this.jobsService.getOne(jobId);
    if (job.files?.path) {
      const loc = this.filesystemService.location(
        FileLocationTypes.JOB,
        job.files.path,
      );
      return loc.createFolder();
    }

    const loc = await this.jobLocationResolver(job);

    await loc.createFolder();

    await this.jobsService.updateJob({
      jobId: job.jobId,
      files: {
        ...job.files,
        path: loc.path,
      },
    });
    return loc;
  }

  async writeJobFiles(jobId: number, req: Request): Promise<Job> {
    const loc = await this.addFolderPathToJob(jobId);

    await loc.writeFormFiles(req);

    const fileNames = await loc.readDir();
    return this.jobsService.updateJob({
      jobId,
      files: {
        path: loc.path,
        fileNames: [...fileNames.map((dir) => dir.name)],
      },
    });
  }

  async moveUserFilesToJob(
    jobId: number,
    userName: string,
    names: string[],
  ): Promise<Job> {
    const dest = await this.addFolderPathToJob(jobId);

    const source = this.filesystemService.location(
      FileLocationTypes.USER,
      userName,
    );
    await Promise.all(
      names.map((name) => new JobFile(source, name).move(dest)),
    );

    const fileNames = await dest.readDir();
    return this.jobsService.updateJob({
      jobId,
      files: {
        path: dest.path,
        fileNames: [...fileNames.map((dir) => dir.name)],
      },
    });
  }

  async copyFtpFilesToJob(jobId: number, names: string[][]): Promise<Job> {
    const dest = await this.addFolderPathToJob(jobId);

    await Promise.all(
      names.map((sourcePath) => {
        const fileName = last(sourcePath) || '';
        const filePath = sourcePath.slice(0, -1);
        const source = this.filesystemService.location(
          FileLocationTypes.FTP,
          filePath,
        );
        return new JobFile(source, fileName).copy(dest);
      }),
    );

    const fileNames = await dest.readDir();
    return this.jobsService.updateJob({
      jobId,
      files: {
        path: dest.path,
        fileNames: [...fileNames.map((dir) => dir.name)],
      },
    });
  }

  async updateJobFolderPath(jobId: number): Promise<FileLocation> {
    const job = await this.jobsService.getOne(jobId);

    if (!job.files) return this.addFolderPathToJob(jobId);

    const oldLoc = this.filesystemService.location(
      FileLocationTypes.JOB,
      job.files.path,
    );
    const newLoc = await this.jobLocationResolver(job);

    if (oldLoc.resolve() === newLoc.resolve()) {
      throw new BadRequestException(`Nothing to change!`);
    }

    try {
      await oldLoc.rename(newLoc);
    } catch (error) {
      throw new BadRequestException(
        `Job ${jobId} folder rename unsussecful. "${oldLoc.resolve()}" -> "${newLoc.resolve()}"`,
      );
    }

    this.logger.log(
      `Job ${jobId} folder renamed. "${oldLoc.resolve()}" -> "${newLoc.resolve()}"`,
    );

    await this.jobsService.updateJob({
      jobId,
      files: {
        ...job.files,
        path: newLoc.path,
      },
    });

    return newLoc;
  }

  private async jobLocationResolver(job: Job): Promise<FileLocation> {
    const { code: custCode } = await this.customersService.getCustomerByName(
      job.customer,
    );

    return this.filesystemService.location(FileLocationTypes.NEWJOB, {
      ...job,
      custCode,
    });
  }
}
