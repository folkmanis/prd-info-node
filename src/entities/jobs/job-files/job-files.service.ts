import { Injectable, NotFoundException } from '@nestjs/common';
import { JobFile, FileLocationTypes, FileLocation, FilesystemService } from '../../../filesystem';
import { JobsService } from '../jobs.service';
import { CustomersService } from '../../customers/customers.service';
import { Request } from 'express';
import { Job, Files } from '../entities/job.entity';
import { last } from 'lodash';


@Injectable()
export class JobFilesService {

    constructor(
        private readonly filesystemService: FilesystemService,
        private readonly jobsService: JobsService,
        private readonly customersService: CustomersService,
    ) { }

    async addFolderPathToJob(jobId: number): Promise<FileLocation> {

        let job = await this.jobsService.getOne(jobId);
        if (job.files?.path) {
            const loc = this.filesystemService.location(FileLocationTypes.JOB, job.files.path);
            return loc.createFolder();
        }

        const { code } = await this.customersService.getCustomerByName(
            job.customer,
        );

        const loc = this.filesystemService.location(
            FileLocationTypes.NEWJOB,
            { ...job, custCode: code }
        );

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
                fileNames: [...fileNames.map(dir => dir.name)],
            },
        });
    }

    async moveUserFilesToJob(
        jobId: number,
        userName: string,
        names: string[],
    ): Promise<Job> {

        const dest = await this.addFolderPathToJob(jobId);

        const source = this.filesystemService.location(FileLocationTypes.USER, userName);
        await Promise.all(names.map(name => new JobFile(source, name).move(dest)));

        const fileNames = await dest.readDir();
        return this.jobsService.updateJob({
            jobId,
            files: {
                path: dest.path,
                fileNames: [...fileNames.map(dir => dir.name)],
            },
        });
    }

    async copyFtpFilesToJob(jobId: number, names: string[][]): Promise<Job> {

        const dest = await this.addFolderPathToJob(jobId);

        await Promise.all(names.map(sourcePath => {
            const fileName = last(sourcePath) || '';
            const filePath = sourcePath.slice(0, -1);
            const source = this.filesystemService.location(FileLocationTypes.FTP, filePath);
            return new JobFile(source, fileName).copy(dest);
        }
        ));

        const fileNames = await dest.readDir();
        return this.jobsService.updateJob({
            jobId,
            files: {
                path: dest.path,
                fileNames: [...fileNames.map(dir => dir.name)],
            },
        });
    }


}