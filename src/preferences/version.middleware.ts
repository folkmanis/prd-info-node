import { NextFunction, Request, Response, RequestHandler } from 'express';
import { VERSION } from '../version';

export function versionMiddleware(): RequestHandler {

    return (req: Request, res: Response, next: NextFunction) => {
        res.set({
            'API-Version': VERSION.apiBuild,
            'APP-Version': VERSION.appBuild,
        });
        req.version = { ...VERSION };
        next();
    };

}
