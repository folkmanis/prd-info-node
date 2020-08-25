import { NextFunction, Request, Response, RequestHandler } from 'express';
import { promises as fsPromises } from 'fs';
import * as path from 'path';
import Logger from './logger';
import { Version } from '../interfaces/version.interface';

const FILENAME = 'version.json';

export class VersionHandler {
    private version: Version | undefined;

    async initVersion(): Promise<VersionHandler> {
        const pathname = path.resolve(process.cwd(), FILENAME);
        return fsPromises.readFile(pathname, { encoding: 'utf8' })
            .then(vObj => {
                this.version = JSON.parse(vObj) as Version;
                Logger.info(`API build ${this.version.apiBuild}`, vObj);
                return this;
            })
            .catch(err => {
                Logger.error('version.json not found', err);
                return this;
            });

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