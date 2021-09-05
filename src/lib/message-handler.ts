import { NextFunction, Request, RequestHandler, Response } from 'express';
import { NotificationsDao } from '../dao/notificationsDAO';

export function notificationHandler(dao: NotificationsDao): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    new Promise((resolve) => res.on('finish', resolve)).then(
      finishHandler(req, res, dao),
    );
    next();
  };
}

function finishHandler(
  req: Request,
  res: Response,
  dao: NotificationsDao,
): () => Promise<boolean> {
  return async () => {
    if (!res.notification) {
      return false;
    }
    res.notification.instanceId = req.instanceId;
    return dao.add(res.notification);
  };
}
