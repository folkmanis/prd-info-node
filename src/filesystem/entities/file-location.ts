import { BadRequestException } from '@nestjs/common';
import Busboy from 'busboy';
import { Request } from 'express';
import { createWriteStream, Dirent } from 'fs';
import { cp, mkdir, readdir, rename } from 'fs/promises';
import path from 'path';
import { sanitizeFileName } from '../../lib/filename-functions';


export interface JobPathComponents {
    receivedDate: Date;
    custCode: string;
    jobId: number;
    name: string;
}

export class FileLocation {

    constructor(
        public path: string[]
    ) { }

    async createFolder(): Promise<FileLocation> {
        const p = this.resolve();
        try {
            await mkdir(p, { recursive: true });
            return this;
        } catch (error) {
            throw new BadRequestException(`Failed to create folder ${p}`);
        }
    }

    resolve(filename?: string): string {
        const p = this.path.join(path.sep);

        if (!filename) {
            return p;
        } else {
            return p.concat(path.sep, sanitizeFileName(filename));
        }

    }

    async readDir(): Promise<Dirent[]> {
        return readdir(
            this.resolve(), { withFileTypes: true }
        );
    }

    async copy(dest: FileLocation): Promise<void> {

        const src = this.resolve();
        const dst = dest.resolve();

        await dest.createFolder();

        try {
            return cp(src, dst, { recursive: true, preserveTimestamps: true });
        } catch (error) {
            throw new BadRequestException(`Failed to copy directory ${src} to ${dst}. Error: ${error}`);
        }

    }

    async rename(dest: FileLocation) {
        const src = this.resolve();
        const dst = dest.resolve();

        await dest.createFolder();

        try {
            return rename(src, dst);
        } catch (error) {
            throw new BadRequestException(`Failed to move directory ${src} to ${dst}. Error: ${error}`);
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
