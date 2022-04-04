import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Credentials } from 'google-auth-library';
import { Auth, google, oauth2_v2 } from 'googleapis';
import { GoogleConfig } from '../google-config.interface';

const auth = google.auth;

@Injectable()
export class Oauth2Service {

    get redirectUrl(): string {
        return this.config.oAuthRedirect;
    }

    get redirectPath(): string {
        return new URL(this.redirectUrl).pathname;
    }

    private config = this.configService.get('google') as GoogleConfig;

    private oauth2Client = new auth.OAuth2({
        clientId: this.config.web.client_id,
        clientSecret: this.config.web.client_secret,
        redirectUri: this.config.oAuthRedirect,
    });


    constructor(
        private configService: ConfigService,
        private jwtService: JwtService,
    ) { }


    async getAuthUrl(sessionId: string, scopes: string[]): Promise<string> {

        const state = await this.jwtService.signAsync({ s: sessionId });

        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [...this.config.scopes, ...scopes],
            state,
            include_granted_scopes: true,
        });
    }

    async getCredentials(code: string, state: string, sessionId: string): Promise<Credentials> {

        const tokenData: { s: string; } = await this.jwtService.verifyAsync(state);

        if (tokenData.s !== sessionId) {
            throw new BadRequestException('Invalid state returned');
        }

        const { tokens } = await this.oauth2Client.getToken(code);

        return tokens;
    }

    async getUserProfile(tokens: Credentials): Promise<oauth2_v2.Schema$Userinfo> {


        this.oauth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });


        const { data } = await oauth2.userinfo.v2.me.get({});

        return data;
    }

    createAuthClient(tokens: Credentials): Auth.OAuth2Client {

        const client = new auth.OAuth2({
            clientId: this.config.web.client_id,
            clientSecret: this.config.web.client_secret,
            redirectUri: this.config.oAuthRedirect,
        });
        client.setCredentials(tokens);

        return client;

    }

}
