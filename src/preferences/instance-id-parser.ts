import { NextFunction, Request, Response, RequestHandler } from 'express';

export function parseInstanceId(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    req.instanceId = req.get('Instance-Id');
    next();
  };
}
