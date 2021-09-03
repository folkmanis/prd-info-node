import { NextFunction, Request, Response } from "express";

export function userSessionMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.session?.user) {
        req.session.lastSeen = {
            ip: req.ip,
            date: new Date(),
        };
    }
    next();
}
