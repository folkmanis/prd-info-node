import { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncWrapper = (action: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            return await action(req, res, next);
        }
        catch (error) {
            console.error(error);
            next(error);
        }
    };
};
