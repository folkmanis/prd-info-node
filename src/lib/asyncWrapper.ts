import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Logger } from '@overnightjs/logger';

export const asyncWrapper = (action: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            return await action(req, res, next);
        }
        catch (error) {
            Logger.Err(error);
            next(error);
        }
    };
};
