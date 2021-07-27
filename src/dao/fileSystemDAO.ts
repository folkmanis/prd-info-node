import { promises as fsPromises, createWriteStream, Stats } from 'fs';
import Logger from '../lib/logger';
import path from 'path';
import { Dao, FsOperations } from '../interfaces';
import { Db } from 'mongodb';
import chokidar from 'chokidar';


export class FileSystemDao extends Dao {

    protected readonly rootPath = process.env.JOBS_INPUT as string;
    protected readonly ftpPath = process.env.FTP_FOLDER as string;

    async injectDb(_: Db) { }

    async createFolder(folder: string[]): Promise<void> {
        const fullPath = path.resolve(this.rootPath, ...folder);
        const resp = await fsPromises.mkdir(fullPath, { recursive: true });
        Logger.info(`Folder ${fullPath} created`, { fullPath, resp });
        return;
    }

    resolveFullPath(folder: string[], filename: string): string {
        return path.resolve(this.rootPath, ...folder, filename);
    }

    writeFile(file: NodeJS.ReadableStream, folder: string[], filename: string) {
        const fullPath = this.resolveFullPath(folder, filename);
        file.pipe(createWriteStream(fullPath));
    }

    startFtpWatch(callback: (operation: FsOperations, path: string[], stats?: Stats) => void) {
        const watcher = chokidar.watch(this.ftpPath, {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            persistent: true,
            ignoreInitial: true,
            usePolling: true,
        });
        watcher
            .on('add', this.ftpCallback('add', callback))
            .on('addDir', this.ftpCallback('addDir', callback))
            .on('change', this.ftpCallback('change', callback))
            .on('unlink', this.ftpCallback('unlink', callback))
            .on('ready', () => callback('ready', this.ftpPath.split('/')));
    }

    private ftpCallback(event: FsOperations, callback: (operation: FsOperations, path: string[], stats?: Stats) => void) {
        return (path: string, stats?: Stats) => {
            callback(
                event,
                path.slice(this.ftpPath.length + 1).split('/'),
                stats,
            );
        };
    }

}
