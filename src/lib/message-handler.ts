import { Request, Response, NextFunction, RequestHandler } from 'express';
import { MessagesDao } from '../dao/messagesDAO';

export function messageHandler(dao: MessagesDao): RequestHandler {
    console.log('handler');
    return async (req: Request, res: Response, next: NextFunction) => {
        new Promise(resolve => res.on('finish', resolve))
            .then(() => res.message && dao.add(res.message));
        next();
    };
}
