import chokidar, { FSWatcher } from 'chokidar';
import { createWriteStream, promises as fsPromises } from 'fs';
import { Db } from 'mongodb';
import path from 'path';
import { Dao } from '../interfaces';
import Logger from '../lib/logger';

export class FileSystemDao extends Dao {
  protected readonly rootPath = process.env.JOBS_INPUT as string;
  readonly ftpPath = process.env.FTP_FOLDER as string;

  async injectDb(_: Db) {}

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

  startFtpWatch(): FSWatcher {
    return chokidar.watch(this.ftpPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
      usePolling: true,
      awaitWriteFinish: {
        stabilityThreshold: 3000,
        pollInterval: 500,
      },
    });
  }
}
