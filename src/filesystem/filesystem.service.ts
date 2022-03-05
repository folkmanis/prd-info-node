import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Busboy from 'busboy';
import { Request } from 'express';
import { constants, createWriteStream } from 'fs';
import { copyFile, mkdir, readdir, rename, rm, writeFile } from 'fs/promises';
import path from 'path';
import { FolderPathService } from './folder-path.service';

const HOMES_ROOT = 'UserFiles';

interface DirReadResponse {
  folders: string[];
  files: string[];
}

@Injectable()
export class FilesystemService {

  protected readonly rootPath = this.configService.get<string>('JOBS_INPUT')!;
  protected readonly ftpPath = this.configService.get<string>('FTP_FOLDER')!;

  constructor(
    private configService: ConfigService,
    private folderPathService: FolderPathService,
  ) { }

  async createFolder(folder: string[]) {
    const fullPath = this.resolveFullPath(...folder);
    await mkdir(fullPath, { recursive: true });
  }

  async uploadUserFiles(path: string[], req: Request) {
    return this.writeFormFile([HOMES_ROOT, ...path], req);
  }

  async removeUserFile(path: string[], filename: string): Promise<number> {
    try {

      await rm(
        this.resolveFullPath(
          HOMES_ROOT,
          ...path,
          filename,
        ),
        { recursive: true }
      );
      return 1;

    } catch (error) {
      throw new BadRequestException(error);
    }
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

  async moveUserFile(source: string[], dest: string[]) {
    try {
      await rename(
        this.resolveFullPath(HOMES_ROOT, ...source),
        this.resolveFullPath(this.rootPath, ...dest)
      );
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async copyFtpFile(source: string[], dest: string[]) {
    try {
      await copyFile(
        this.resolveFullPath(this.ftpPath, ...source),
        this.resolveFullPath(this.rootPath, ...dest),
        constants.COPYFILE_FICLONE
      );
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async writeBuffer(buff: Buffer, destination: string[]) {
    writeFile(
      this.resolveFullPath(HOMES_ROOT, ...destination),
      buff,
    );
  }

  async readJobDir(path: string[]): Promise<string[]> {
    return readdir(
      this.resolveFullPath(this.rootPath, ...path)
    );
  }

  async readFtpDir(path: string[]): Promise<DirReadResponse> {
    const entries = await readdir(
      this.resolveFullPath(this.ftpPath, ...path),
      { withFileTypes: true }
    );
    return {
      files: entries.filter(entry => entry.isFile()).map(entry => entry.name),
      folders: entries.filter(entry => entry.isDirectory()).map(entry => entry.name)
    };
  }

  private resolveFullPath(...relativePath: string[]): string {
    return path.resolve(this.rootPath, ...relativePath);
  }


}
