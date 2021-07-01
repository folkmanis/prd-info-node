import { promises as fsPromises, createWriteStream } from 'fs';
import Logger from '../lib/logger';
import path from 'path';
import { Dao } from '../interfaces/dao.interface';
import { Db } from 'mongodb';

let rootPath: string;

export class FileSystemDao extends Dao {

    async injectDb(_: Db) {
        rootPath = process.env.JOBS_INPUT as string;
    }

    async createFolder(folder: string[]): Promise<void> {
        const fullPath = path.resolve(rootPath, ...folder);
        const resp = await fsPromises.mkdir(fullPath, { recursive: true });
        Logger.info(`Folder ${fullPath} created`, { fullPath, resp });
        return;
    }

    resolveFullPath(folder: string[], filename: string): string {
        return path.resolve(rootPath, ...folder, filename);
    }

    writeFile(file: NodeJS.ReadableStream, folder: string[], filename: string) {
        const fullPath = this.resolveFullPath(folder, filename);
        file.pipe(createWriteStream(fullPath));
    }
}