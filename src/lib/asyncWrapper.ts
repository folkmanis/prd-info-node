import { Request, Response, NextFunction, RequestHandler } from 'express';
import Logger from './logger';

export const asyncWrapper = (action: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            return await action(req, res, next);
        }
        catch (error) {
            console.error(error);
            if (req.log) {
                // Logger.error('Error', { error, req });
            } else {
                // Logger.error(error);
            }
            res.json({error})
            // next(error);
        }
    };
};
