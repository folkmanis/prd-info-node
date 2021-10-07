// import * as session from 'express-session';

declare namespace Express {

    type Modules = 'kastes' | 'system' | 'jobs' | 'paytraq' | 'calculations' | 'admin' | 'xmf-search' | 'xmf-upload' | 'jobs-admin';

    export interface Request {
        version?: Version;
        instanceId?: string;
        session: session.SessionData;
    }


    export interface Response<ResBody = any,
        Locals extends Record<string, any> = Record<string, any>,
        StatusCode extends number = number> {
        result?: { [key: string]: any; };
        notification?: {
            timestamp: Date;
            instanceId: string | undefined,
            module: Modules;
            payload: any;
        };
    }


}


interface Version {
    apiBuild: number;
    appBuild: number;
}
