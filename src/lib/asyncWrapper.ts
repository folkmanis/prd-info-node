import { Request, Response, NextFunction, RequestHandler } from 'express';
import Logger from './logger';

export const asyncWrapper = (action: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            return await action(req, res, next);
        }
        catch (error) {
            if (req.log) {
                req.log.error(error);
            } else {
                Logger.error(error);
            }
            next(error);
        }
    };
};
