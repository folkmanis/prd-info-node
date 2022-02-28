import { OAuth2Client } from 'google-auth-library';

declare global {

    namespace Express {

        type Modules = 'kastes' | 'system' | 'jobs' | 'paytraq' | 'calculations' | 'admin' | 'xmf-search' | 'xmf-upload' | 'jobs-admin';

        interface Request {
            version?: Version;
            instanceId?: string;
            oAuth2?: OAuth2Client;
        }

    }


    interface Version {
        apiBuild: number;
        appBuild: number;
    }
}
