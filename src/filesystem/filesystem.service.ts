import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Busboy from 'busboy';
import { Request } from 'express';
import { createWriteStream, promises as fsPromises } from 'fs';
import path from 'path';
import { FolderPathService } from './folder-path.service';

@Injectable()
export class FilesystemService {

    constructor(
        private configService: ConfigService,
        private folderPathService: FolderPathService,
    ) { }

    protected readonly rootPath = this.configService.get<string>('JOBS_INPUT')!;

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



    private writeFile(file: NodeJS.ReadableStream, folder: string[], filename: string) {
        const fullPath = this.resolveFullPath(...folder, filename);
        file.pipe(createWriteStream(fullPath));
    }

    async writeFormFile(path: string[], req: Request, filenames?: string[]): Promise<string[]> {

        const busboy = Busboy({ headers: req.headers });

        const fileNames = new Set<string>(filenames);

        return new Promise(resolve => {

            busboy.on('file', (_, file, fName) => {
                const name = this.folderPathService.sanitizeFileName(fName.filename);
                fileNames.add(name);
                this.writeFile(file, path, fName.filename);
            });

            busboy.on('finish', () => {
                resolve([...fileNames.values()]);
            });
            req.pipe(busboy);

        });

    }

}
