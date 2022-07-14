import { BadRequestException } from '@nestjs/common';
import Busboy from 'busboy';
import { Request } from 'express';
import { createWriteStream, Dirent } from 'fs';
import { cp, mkdir, readdir, rename } from 'fs/promises';
import { last } from 'lodash';
import path from 'path';
import { sanitizeFileName } from '../../lib/filename-functions';
import { FileElement, fromDirent } from './file-element';


export interface JobPathComponents {
    receivedDate: Date;
    custCode: string;
    jobId: number;
    name: string;
}

export class FileLocation {

    path: string[];

    private rootPath: string[] = [];

    get fileElement(): FileElement {
        return {
            isFolder: true,
            name: last(this.path) || '..',
            parent: this.path.slice(0, -1),
        };
    }

    constructor(
        params: { root: string; path: string[]; }
    ) {
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

    resolve(filename?: string): string {
        const p = [...this.rootPath, ...this.path].join(path.sep);

        if (!filename) {
            return p;
        } else {
            return p.concat(path.sep, sanitizeFileName(filename));
        }

    }

    async readDir(): Promise<FileElement[]> {
        const dirents = await readdir(
            this.resolve(), { withFileTypes: true }
        );
        return dirents.map(fromDirent(this.path));
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

