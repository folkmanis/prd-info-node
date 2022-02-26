import { Injectable, FactoryProvider, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { GoogleAuthService } from './google-auth.service';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { GoogleConfig } from './google-config.interface';
import { OAuth2Client } from 'google-auth-library';

declare module 'express' {
    export interface Request {
        oAuth2?: OAuth2Client;
    }

}


@Injectable()
export class GoogleAuthMiddleware implements NestMiddleware {

    private config = this.configService.get('google') as GoogleConfig;

    constructor(
        private configService: ConfigService,
    ) { }

    use(req: Request, res: Response, next: NextFunction) {

        console.log(req.session);
        const eMail = req.session?.user?.eMail;


        if (!eMail) {
            next();
            return;
        }

        const { credentialsLocation, scope, account } = this.config;

        const oAuth2: OAuth2Client = new google.auth.JWT({
            scopes: [scope],
            subject: eMail,
            keyFile: credentialsLocation,
            email: account.client_email,
            keyId: account.private_key_id,
            key: account.private_key,
        });

        req.oAuth2 = oAuth2;

        next();
    }
}
