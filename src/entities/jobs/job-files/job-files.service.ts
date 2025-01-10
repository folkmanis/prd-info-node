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
  ) {}

  async addFolderPathToJob(jobId: number): Promise<FileLocation> {
    const job = await this.jobsService.getOne(jobId);
    if (job.files) {
      const loc = this.filesystemService.location(
        FileLocationTypes.JOB,
        job.files.path,
      );
      return loc.createFolder();
    } else {
      const loc = await this.jobLocationResolver(job);

      await loc.createFolder();

      await this.jobsService.updateJob({
        jobId: job.jobId,
        files: {
          path: loc.path,
        },
      });
      return loc;
    }
  }

  async writeJobFiles(jobId: number, req: Request): Promise<Job> {
    const loc = await this.addFolderPathToJob(jobId);

    await loc.writeFormFiles(req);

    return this.writeDirToJob(jobId, loc);
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

    return this.writeDirToJob(jobId, dest);
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

    return this.writeDirToJob(jobId, dest);
  }

  async updateJobFolderPath(jobId: number): Promise<Job> {
    const job = await this.jobsService.getOne(jobId);

    if (!job.files) {
      this.addFolderPathToJob(jobId);
      return this.jobsService.getOne(jobId);
    }

    const oldLoc = this.filesystemService.location(
      FileLocationTypes.JOB,
      job.files.path,
    );

    const { code: custCode } = await this.customersService.getCustomerByName(
      job.customer,
    );
    const newLoc = this.filesystemService.location(FileLocationTypes.NEWJOB, {
      ...job,
      custCode,
    });

    if (oldLoc.resolve() === newLoc.resolve()) {
      throw new BadRequestException(`Nothing to change!`);
    }

    try {
      await oldLoc.rename(newLoc);
    } catch (error) {
      throw new BadRequestException(
        `Job ${jobId} folder rename unsuccesful. "${oldLoc.resolve()}" -> "${newLoc.resolve()}"`,
      );
    }

    this.logger.log(
      `Job ${jobId} folder renamed. "${oldLoc.resolve()}" -> "${newLoc.resolve()}"`,
    );

    return this.writeDirToJob(jobId, newLoc);
  }

  async copyJobFilesToNewJob(jobId: number, newJobId: number): Promise<Job> {
    const { files } = await this.jobsService.getOne(jobId);
    assertPath(files?.path);

    const oldLoc = this.filesystemService.location(
      FileLocationTypes.JOB,
      files.path,
    );

    console.log('oldLoc', oldLoc);
    console.log('newJobId', newJobId);
    const newLoc = await this.addFolderPathToJob(newJobId);
    console.log('newLoc', newLoc);

    const count = await oldLoc.copyContents(newLoc);

    this.logger.log(
      `Copied ${count} files from job ${jobId} to job ${newJobId}`,
    );

    return this.writeDirToJob(newJobId, newLoc);
  }

  private async jobLocationResolver(job: Job): Promise<FileLocation> {
    if (job.files) {
      return this.filesystemService.location(
        FileLocationTypes.JOB,
        job.files.path,
      );
    } else {
      const { code: custCode } = await this.customersService.getCustomerByName(
        job.customer,
      );
      return this.filesystemService.location(FileLocationTypes.NEWJOB, {
        ...job,
        custCode,
      });
    }
  }

  private async writeDirToJob(jobId: number, dest: FileLocation): Promise<Job> {
    const fileNames = await dest.readDir();
    return this.jobsService.updateJob({
      jobId,
      files: {
        path: dest.path,
        fileNames: [...fileNames.map((dir) => dir.name)],
      },
    });
  }
}

function assertPath(path: unknown): asserts path is string[] {
  if (!Array.isArray(path)) {
    throw new BadRequestException(`Invalid path: ${path}`);
  }
}
