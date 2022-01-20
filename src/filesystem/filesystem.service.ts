import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Busboy from 'busboy';
import { Request } from 'express';
import { createWriteStream, promises as fsPromises } from 'fs';
import path from 'path';
import { FolderPathService } from './folder-path.service';

@Injectable()
export class FilesystemService {
  protected readonly rootPath = this.configService.get<string>('JOBS_INPUT')!;

  constructor(
    private configService: ConfigService,
    private folderPathService: FolderPathService,
  ) { }

  async createFolder(folder: string[]) {
    const fullPath = path.resolve(this.rootPath, ...folder);
    const created = await fsPromises.mkdir(fullPath, { recursive: true });
    if (!created) {
      throw new Error(`Unable to create folder ${path.join(...folder)}`);
    }
    return created;
  }

  resolveFullPath(...relativePathWithFilename: string[]): string {
    return path.resolve(this.rootPath, ...relativePathWithFilename);
  }

  async writeFormFile(
    path: string[],
    req: Request,
    existingFilenames?: string[],
  ): Promise<string[]> {

    const busboy = Busboy({ headers: req.headers });

    const fileNames = new Set<string>(existingFilenames);

    return new Promise((resolve) => {
      busboy.on('file', (_, file, fileInfo) => {
        const name = this.folderPathService.sanitizeFileName(fileInfo.filename);
        fileNames.add(name);
        const fullPath = this.resolveFullPath(...path, name);
        file.pipe(createWriteStream(fullPath));
      });

      busboy.on('finish', () => {
        resolve([...fileNames.values()]);
      });
      req.pipe(busboy);
    });
  }
}
