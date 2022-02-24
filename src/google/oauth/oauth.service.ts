import { Injectable, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Credentials } from './interfaces/oauth2-credentials.class';
import { PreferencesService, SystemSystemPreference } from '../../preferences';

@Injectable()
export class OauthService {

    constructor(
        private configService: ConfigService,
        private preferences: PreferencesService,
    ) { }

    async getCredentials(): Promise<OAuth2Credentials> {
        const credentials = this.configService.get('oAuth2');
        const { hostname } = await this.preferences.getModuleSystemPreferences('system') as SystemSystemPreference;
        if (!credentials) {
            throw new NotImplementedException('Credentials missing');
        }
        console.log(credentials);
        return credentials;
    }

}
