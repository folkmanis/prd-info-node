import { promises as fsPromises, createWriteStream } from 'fs';
import Logger from '../lib/logger';
import path from 'path';

let rootPath: string;

export class fileSystemDAO {
    static async injectDB() {
        rootPath = process.env.JOBS_INPUT as string;
        console.log(rootPath);
    }

    static async createFolder(folder: string[]): Promise<void> {
        const fullPath = path.resolve(rootPath, ...folder);
        const resp = await fsPromises.mkdir(fullPath, { recursive: true });
        Logger.info(`Folder ${fullPath} created`, { fullPath, resp });
        return;
    }

    static resolveFullPath(folder: string[], filename: string): string {
        return path.resolve(rootPath, ...folder, filename);
    }

    static writeFile(file: NodeJS.ReadableStream, folder: string[], filename: string) {
        const fullPath = this.resolveFullPath(folder, filename);
        file.pipe(createWriteStream(fullPath));
    }
}