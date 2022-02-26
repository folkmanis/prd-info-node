import { Injectable, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleConfig, OAuth2Credentials } from './interfaces/oauth2-credentials.class';
import { PreferencesService, SystemSystemPreference } from '../../preferences';
import { readFile } from 'fs/promises';
import { plainToClass, Expose, Type } from 'class-transformer';
import { IsString, IsUrl, IsDataURI, ValidateNested, Equals } from 'class-validator';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

@Injectable()
export class OauthService {

    constructor(
        private configService: ConfigService,
        private preferences: PreferencesService,
    ) { }

    async getCredentials(token: string) {

        const location = this.configService.get('credentialsLocation');
        const credentials = JSON.parse(await readFile(location, { encoding: 'utf8' }));


        const authClient = new google.auth.JWT({
            scopes: [this.configService.get('scope') as string],
            subject: 'edmunds@paraugdarbi.lv',
            keyFile: location,
        });

        await authClient.authorize();

        // const auth = new google.auth.GoogleAuth({
        //     credentials,
        //     // keyFile: location,
        //     scopes: [this.configService.get('scope') as string]
        // });
        // const client = await auth.getClient() as JWT;
        // console.log(client);
        // await client.authorize();
        const gmail = google.gmail({
            version: 'v1',
            auth: authClient,
        });
        // return gmail;

        return (await gmail.users.threads.list({ maxResults: 10, userId: 'edmunds@paraugdarbi.lv' })).data.threads;

        // const credentials = plainToClass(OAuth2Credentials, JSON.parse(await readFile(location, { encoding: 'utf8' })));
        const { hostname } = await this.preferences.getModuleSystemPreferences('system') as SystemSystemPreference;
        const redirect_uri = new URL(hostname);
        redirect_uri.pathname = 'data/login/googleapi';

        const reqParams: Record<string, any> = {

            client_id: credentials.client_id,
            redirect_uri: redirect_uri.toString(),
            scope: this.configService.get('scope'),
            state: token,
        };

        return plainToClass(GoogleConfig, reqParams);

        if (!credentials) {
            throw new NotImplementedException('Credentials missing');
        }
        console.log(credentials);
    }

    /*     try {
            const oAuth2 = plainToClass(OAuth2Credentials, installed);
            await validateOrReject(oAuth2, { whitelist: true });
            return { oAuth2 };
        
          } catch (error) {
            console.error(error);
            return { oAuth2: undefined };
          }
     */

}
