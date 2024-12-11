import { BadRequestException } from '@nestjs/common';
import Busboy from 'busboy';
import { Request } from 'express';
import { CopyOptions, createWriteStream } from 'fs';
import { cp, mkdir, readdir, rename } from 'fs/promises';
import path from 'path';
import { sanitizeFileName } from '../../lib/filename-functions.js';
import { FileElement, fromDirent } from './file-element.js';

export interface JobPathComponents {
  receivedDate: Date;
  custCode: string;
  jobId: number;
  name: string;
}

export class FileLocation {
  path: string[];

  private rootPath: string[] = [];

  constructor(params: { root: string; path: string[] }) {
    this.rootPath = params.root.split(path.sep);
    this.path = params.path;
  }

  async createFolder(): Promise<FileLocation> {
    const p = this.resolve();
    try {
      await mkdir(p, { recursive: true });
      return this;
    } catch (error) {
      throw new BadRequestException(`Failed to create folder ${p}`);
    }
  }

  resolve(filename = ''): string {
    const p = [...this.rootPath, ...this.path].join(path.sep);

    return p.concat(path.sep, sanitizeFileName(filename));
  }

  async readDir(): Promise<FileElement[]> {
    const dirents = await readdir(this.resolve(), { withFileTypes: true });
    return dirents.map(fromDirent(this.path));
  }

  async copy(dest: FileLocation, options: CopyOptions = {}): Promise<void> {
    options = {
      preserveTimestamps: true,
      recursive: true,
      ...options,
    };
    const src = this.resolve();
    const dst = path.join(dest.resolve());

    console.log(src, dst, options);

    try {
      await cp(src, dst, options);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        `Failed to copy directory ${src} to ${dst}. Error: ${error}`,
      );
    }
  }

  async rename(dest: FileLocation) {
    const src = this.resolve();
    const dst = dest.resolve();

    try {
      await dest.createFolder();
      await rename(src, dst);
    } catch (error) {
      throw new BadRequestException(
        `Failed to move directory ${src} to ${dst}. Error: ${error}`,
      );
    }
  }

  async writeFormFiles(req: Request): Promise<string[]> {
    await this.createFolder();

    const busboy = Busboy({ headers: req.headers });

    const jobFiles: string[] = [];

    return new Promise((resolve) => {
      busboy.on('file', (_, file, fileInfo) => {
        jobFiles.push(fileInfo.filename);

        file.pipe(createWriteStream(this.resolve(fileInfo.filename)));
      });

      busboy.on('finish', () => resolve(jobFiles));

      req.pipe(busboy);
    });
  }
}
