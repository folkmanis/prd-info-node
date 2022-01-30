import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Busboy from 'busboy';
import { Request } from 'express';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';
import { FolderPathService } from './folder-path.service';

const TEMP_FOLDER = 'TemporaryUploads';

@Injectable()
export class FilesystemService {
  protected readonly rootPath = this.configService.get<string>('JOBS_INPUT')!;

  constructor(
    private configService: ConfigService,
    private folderPathService: FolderPathService,
  ) { }

  async createFolder(folder: string[]) {
    const fullPath = this.resolveFullPath(...folder);
    await mkdir(fullPath, { recursive: true });
  }

  async writeFormFile(
    path: string[],
    req: Request,
  ): Promise<string[]> {

    await this.createFolder(path);

    const busboy = Busboy({ headers: req.headers });

    const fileNames: string[] = [];

    return new Promise((resolve) => {
      busboy.on('file', (_, file, fileInfo) => {
        const name = this.folderPathService.sanitizeFileName(fileInfo.filename);
        fileNames.push(name);
        const fullPath = this.resolveFullPath(...path, name);

        file.pipe(createWriteStream(fullPath));
      });

      busboy.on('finish', () => {
        resolve(fileNames);
      });
      req.pipe(busboy);
    });
  }

  async writeTempfiles(req: Request): Promise<string[]> {
    return this.writeFormFile([TEMP_FOLDER], req);
  }

  private resolveFullPath(...relativePath: string[]): string {
    return path.resolve(this.rootPath, ...relativePath);
  }


}
