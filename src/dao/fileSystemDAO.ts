import { promises as fsPromises } from 'fs';
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
        return resp;
    }
}