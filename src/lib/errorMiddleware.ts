import { Request, Response, NextFunction } from 'express';

export function logError(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // tslint:disable-next-line:no-console
  // console.log('Error occured in the controller class ', error.message);
  req.log.error('Error occured', {
    message: error.message,
    name: error.name,
    stack: error.stack,
  });
  // tslint:disable-next-line:no-console
  console.log('Stopping request processing');
  res.status(404).json({ error: error.message });
}

export function logErrorAndContinue(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // tslint:disable-next-line:no-console
  console.log('Error occured in the request', error.message);
  // tslint:disable-next-line:no-console
  console.log('Continuing with request processing');
  next(error);
}
