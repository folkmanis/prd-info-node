import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { sanitizeFileName, toMonthNumberName } from '../lib/filename-functions';
import { FileLocation, JobPathComponents } from './entities/file-location';
import { FileLocationTypes } from './entities/file-location-types';
import { JobFile } from './entities/job-file';
import { FileElement } from './entities/file-element';
import { createWriteStream, CopyOptions } from 'fs';


const HOMES_ROOT = 'UserFiles';

type FileLocationResolver = Record<FileLocationTypes, (params?: any) => { root: string; path: string[]; }>;


@Injectable()
export class FilesystemService {

  private readonly fileLocationsResolvers: FileLocationResolver = {
    [FileLocationTypes.FTP]: (ftpPath: string[] = []) => ({ root: this.configService.get<string>('FTP_FOLDER')!, path: ftpPath }),
    [FileLocationTypes.USER]: (username: string) => ({ root: this.configService.get<string>('JOBS_INPUT')!, path: [HOMES_ROOT, username] }),
    [FileLocationTypes.NEWJOB]: jobPathFromComponents(this.configService.get<string>('JOBS_INPUT')!),
    [FileLocationTypes.JOB]: (jobPath: string[]) => ({ root: this.configService.get<string>('JOBS_INPUT')!, path: jobPath }),
    [FileLocationTypes.DROPFOLDER]: (dropPath: string[]) => ({ root: this.configService.get<string>('DROP_FOLDER')!, path: dropPath }),
  };

  constructor(
    private configService: ConfigService,
  ) { }

  location<T extends FileLocationTypes>(type: T, params: Parameters<FileLocationResolver[T]>[0]): FileLocation {
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

  async readLocation<T extends FileLocationTypes>(
    type: T,
    params: Parameters<FileLocationResolver[T]>[0]
  ): Promise<FileElement[]> {
    const loc = this.location(type, params);
    return loc.readDir();
  }

  async copy(
    srcType: FileLocationTypes,
    dstType: FileLocationTypes,
    srcPath: string[],
    dstPath: string[],
    options: CopyOptions = {},
  ) {
    await this.location(srcType, srcPath)
      .copy(this.location(dstType, dstPath), options);
    return 1;
  }


}


function jobPathFromComponents(jobsRoot: string): (params: JobPathComponents) => { root: string; path: string[]; } {

  return ({ receivedDate, custCode, jobId, name }) => ({
    root: jobsRoot,
    path: [
      new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(
        receivedDate,
      ),
      toMonthNumberName(receivedDate),
      `${custCode}-Input`,
      `${jobId.toString()}-${sanitizeFileName(name)}`,
    ]
  });

}
