import { OAuth2Client } from 'google-auth-library';
import { gmail_v1 } from 'googleapis';
import 'express';

declare module 'express-serve-static-core' {
  type Modules =
    | 'kastes'
    | 'system'
    | 'jobs'
    | 'paytraq'
    | 'calculations'
    | 'admin'
    | 'xmf-search'
    | 'xmf-upload'
    | 'jobs-admin';

  interface Version {
    apiBuild: number;
    appBuild: number;
  }

  interface Request {
    version?: Version;
    instanceId?: string;
    oAuth2?: OAuth2Client;
    gmail?: gmail_v1.Gmail;
  }
}
