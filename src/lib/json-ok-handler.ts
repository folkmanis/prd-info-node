import { NextFunction, Request, Response, RequestHandler, Express } from 'express';

export function jsonOkHandler(): (req: Request, res: Response, next: NextFunction) => void {
    return (req, res, next) => {
        res.jsonOk = (body) => res.json({ error: false, ...body });
        next();
    };
}