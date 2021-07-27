import { Stats } from 'fs';
import path from 'path';
import { FileSystemDao } from '../dao/fileSystemDAO';
import { MessagesDao } from '../dao/messagesDAO';
import Logger from './logger';
import { JobMessage, FsOperations } from '../interfaces';

interface Params {
    fileSystemDao: FileSystemDao;
    messagesDao: MessagesDao;
}

export function startFtpWatcher({ fileSystemDao, messagesDao }: Params) {
    const watchFn: (operation: FsOperations, path: string[], stats?: Stats) => void =
        (operation, path, stats?) => {
            Logger.info(operation, { path, stats });
            messagesDao.add(new JobMessage('ftpUpload', { operation, path }));
        };

    fileSystemDao.startFtpWatch(watchFn);
}