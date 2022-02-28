import { Injectable, NestMiddleware, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { GoogleConfig } from './google-config.interface';


@Injectable()
export class GoogleAuthMiddleware implements NestMiddleware {

    private config = this.configService.get('google') as GoogleConfig;

    constructor(
        private configService: ConfigService,
    ) { }

    use(req: Request, res: Response, next: NextFunction) {

        const eMail = req.session?.user?.eMail;

        if (!eMail || !this.config) {
            next(new NotImplementedException('google services not available'));
            return;
        }

        const { credentialsLocation, scope, account } = this.config;

        req.oAuth2 = new google.auth.JWT({
            scopes: [scope],
            subject: eMail,
            keyFile: credentialsLocation,
            email: account.client_email,
            keyId: account.private_key_id,
            key: account.private_key,
        });

        next();
    }
}
