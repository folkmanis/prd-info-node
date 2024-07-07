import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { sanitizeFileName, toMonthNumberName } from '../lib/filename-functions.js';
import { FileLocation, JobPathComponents } from './entities/file-location.js';
import { FileLocationTypes } from './entities/file-location-types.js';
import { JobFile } from './entities/job-file.js';
import { FileElement } from './entities/file-element.js';
import { CopyOptions } from 'fs';
import { AppConfig } from '../dot-env.config.js';

const HOMES_ROOT = 'UserFiles';

type FileLocationResolver = Record<
  FileLocationTypes,
  (params?: any) => { root: string; path: string[]; }
>;

@Injectable()
export class FilesystemService {
  private readonly fileLocationsResolvers: FileLocationResolver;

  constructor(configService: ConfigService<AppConfig, true>) {
    this.fileLocationsResolvers = this.getResolvers(configService);
  }

  location<T extends FileLocationTypes>(
    type: T,
    params: Parameters<FileLocationResolver[T]>[0],
  ): FileLocation {
    const pathFn = this.fileLocationsResolvers[type];
    return new FileLocation(pathFn(params));
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
    params: Parameters<FileLocationResolver[T]>[0],
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
    await this.location(srcType, srcPath).copy(
      this.location(dstType, dstPath),
      options,
    );
    return 1;
  }

  private getResolvers(configService: ConfigService<AppConfig, true>): FileLocationResolver {
    return {
      [FileLocationTypes.FTP]: (ftpPath: string[] = []) => ({
        root: configService.get('FTP_FOLDER'),
        path: ftpPath,
      }),
      [FileLocationTypes.USER]: (username: string) => ({
        root: configService.get('JOBS_INPUT'),
        path: [HOMES_ROOT, username],
      }),
      [FileLocationTypes.NEWJOB]: jobPathFromComponents(
        configService.get('JOBS_INPUT'),
      ),
      [FileLocationTypes.JOB]: (jobPath: string[]) => ({
        root: configService.get('JOBS_INPUT'),
        path: jobPath,
      }),
      [FileLocationTypes.DROPFOLDER]: (dropPath: string[]) => ({
        root: configService.get('DROP_FOLDER'),
        path: dropPath,
      }),
    };
  }
}

function jobPathFromComponents(
  jobsRoot: string,
): (params: JobPathComponents) => { root: string; path: string[]; } {
  return ({ receivedDate, custCode, jobId, name }) => ({
    root: jobsRoot,
    path: [
      new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(
        receivedDate,
      ),
      toMonthNumberName(receivedDate),
      `${custCode}-Input`,
      `${jobId.toString()}-${sanitizeFileName(name)}`,
    ],
  });
}
