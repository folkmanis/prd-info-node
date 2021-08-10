import { NextFunction, Request, RequestHandler, Response } from 'express';
import { NotificationsDao } from '../dao/notificationsDAO';

export function notificationHandler(dao: NotificationsDao): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
        new Promise(resolve => res.on('finish', resolve))
            .then(() => res.notification && dao.add(res.notification));
        next();
    };
}
