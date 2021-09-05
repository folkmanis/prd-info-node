import { NextFunction, Request, Response, RequestHandler } from 'express';
import Logger from './logger';
import { Version } from '../interfaces/version.interface';
import { VERSION } from '../version';

export class VersionHandler {
  private version: Version | undefined;

  async initVersion(): Promise<VersionHandler> {
    this.version = VERSION;
    Logger.info(`API build ${this.version.apiBuild}`, this.version);
    return this;
  }

  handler(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      if (this.version) {
        res.set({
          'API-Version': this.version.apiBuild,
          'APP-Version': this.version.appBuild,
        });
        req.version = this.version;
        next();
      } else {
        next(new Error('Version not set'));
      }
    };
  }
}
