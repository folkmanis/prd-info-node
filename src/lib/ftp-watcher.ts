import { Stats } from 'fs';
import path from 'path';
import { FileSystemDao } from '../dao/fileSystemDAO';
import { MessagesDao } from '../dao/messagesDAO';
import Logger from './logger';
import { JobMessage, FsOperations } from '../interfaces';
import { FSWatcher } from 'chokidar';

interface Params {
    fileSystemDao: FileSystemDao;
    messagesDao: MessagesDao;
}

export function startFtpWatcher({ fileSystemDao, messagesDao }: Params) {

    const offset = fileSystemDao.ftpPath.length + 1;

    const callbackFn = (operation: FsOperations, isAlert = true) => {
        return (path: string, stats?: Stats) => {
            Logger.info(operation, { path, stats });
            messagesDao.add(
                new JobMessage({
                    action: 'ftpUpload',
                    operation,
                    path: path?.slice(offset).split('/')
                }, isAlert)
            );
        };
    };

    const watcher = fileSystemDao.startFtpWatch();

    watcher
        .on('add', callbackFn('add'))
        .on('addDir', callbackFn('addDir'))
        .on('change', callbackFn('change', false))
        .on('unlink', callbackFn('unlink'))
        .on('ready', () => Logger.info('ftp watch ready', { path: fileSystemDao.ftpPath }));

}

