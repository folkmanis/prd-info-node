import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import path from 'path';
import { sanitizeFileName, toMonthNumberName } from '../lib/filename-functions';
import { FileLocation, JobPathComponents } from './entities/file-location';
import { FileLocationTypes } from './entities/file-location-types';
import { JobFile } from './entities/job-file';


const HOMES_ROOT = 'UserFiles';

type FileLocationResolver = Record<FileLocationTypes, (params?: any) => string[]>;

interface DirReadResponse {
  folders: string[];
  files: string[];
}

@Injectable()
export class FilesystemService {

  private readonly fileLocationsResolvers: FileLocationResolver = {
    [FileLocationTypes.FTP]: (ftpPath: string[] = []) => this.configService.get<string>('FTP_FOLDER')!.split(path.sep).concat(...ftpPath),
    [FileLocationTypes.USER]: (username: string) => this.configService.get<string>('JOBS_INPUT')!.split(path.sep).concat(HOMES_ROOT, username),
    [FileLocationTypes.NEWJOB]: jobPathFromComponents(this.configService.get<string>('JOBS_INPUT')!),
    [FileLocationTypes.JOB]: (jobPath: string[]) => jobPath,
    [FileLocationTypes.DROPFOLDER]: (dropPath: string[]) => this.configService.get<string>('DROP_FOLDER')!.split(path.sep).concat(...dropPath),
  };

  constructor(
    private configService: ConfigService,
  ) { }

  location<T extends FileLocationTypes>(type: T, params: Parameters<typeof this.fileLocationsResolvers[T]>[0]): FileLocation {
    const pathFn = this.fileLocationsResolvers[type];
    return new FileLocation(
      pathFn(params)
    );
  }

  async uploadUserFiles(username: string, req: Request): Promise<string[]> {
    const loc = this.location(FileLocationTypes.USER, username);
    return loc.writeFormFiles(req);
  }

  async removeUserFile(username: string, filename: string): Promise<number> {
    const loc = this.location(FileLocationTypes.USER, username);
    const file = new JobFile(loc, filename);
    return file.remove();
  }

  async writeBufferToUser(buff: Buffer, username: string, fileName: string) {
    const loc = this.location(FileLocationTypes.USER, username);
    const file = new JobFile(loc, fileName);
    return file.write(buff);
  }

  async readFtpDir(path: string[]): Promise<DirReadResponse> {
    const loc = this.location(FileLocationTypes.FTP, path);
    const dirs = await loc.readDir();
    return {
      files: dirs
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name),
      folders: dirs
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name),
    };
  }


}


function jobPathFromComponents(jobsInput: string): (params: JobPathComponents) => string[] {

  const base = jobsInput.split(path.sep);

  return ({ receivedDate, custCode, jobId, name }) => [
    ...base,
    new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(
      receivedDate,
    ),
    toMonthNumberName(receivedDate),
    `${custCode}-Input`,
    `${jobId.toString()}-${sanitizeFileName(name)}`,
  ];

}
