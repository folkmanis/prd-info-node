import { Stats } from 'fs';
import path from 'path';
import { FileSystemDao } from '../dao/fileSystemDAO';
import { MessagesDao } from '../dao/messagesDAO';
import Logger from './logger';
import { JobMessage, FsOperations, SystemNotification } from '../interfaces';
import { NotificationsDao } from '../dao/notificationsDAO';

interface Params {
    fileSystemDao: FileSystemDao;
    messagesDao: MessagesDao;
    notificationsDao: NotificationsDao;
}

export function startFtpWatcher({ fileSystemDao, messagesDao, notificationsDao }: Params) {

    const offset = fileSystemDao.ftpPath.length + 1;

    const callbackFn = (operation: FsOperations, isAlert = true) => {
        return async (path: string, stats?: Stats) => {
            Logger.info(operation, { path, stats });
            const messageId = await messagesDao.add(
                new JobMessage({
                    action: 'ftpUpload',
                    operation,
                    path: path?.slice(offset).split('/')
                }, isAlert)
            );
            notificationsDao.add(new SystemNotification({ operation: 'ftpWatcher', id: messageId }));
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

