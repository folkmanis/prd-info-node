import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWriteStream, promises as fsPromises } from 'fs';
import path from 'path';

@Injectable()
export class FilesystemService {

    constructor(
        private configService: ConfigService,
    ) { }

    protected readonly rootPath = this.configService.get<string>('JOBS_INPUT')!;

    async createFolder(folder: string[]) {
        const fullPath = path.resolve(this.rootPath, ...folder);
        return fsPromises.mkdir(fullPath, { recursive: true });
    }

    resolveFullPath(folder: string[], filename: string): string {
        return path.resolve(this.rootPath, ...folder, filename);
    }

    writeFile(file: NodeJS.ReadableStream, folder: string[], filename: string) {
        const fullPath = this.resolveFullPath(folder, filename);
        file.pipe(createWriteStream(fullPath));
    }

}
