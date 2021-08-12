
declare namespace Express {

    type Modules = 'kastes' | 'system' | 'jobs' | 'paytraq' | 'calculations' | 'admin' | 'xmf-search' | 'xmf-upload' | 'jobs-admin';

    export interface Request {
        userPreferences?: {
            customers: string[],
            modules: Modules[],
        };
        log: {
            debug: (message: string, metadata?: any) => void,
            info: (message: string, metadata?: any) => void,
            error: (message: string, metadata?: any) => void,
        };
        systemPreferences?: Map<string, { [key: string]: any; }>;
        version?: Version;
        instanceId?: string;
    }


    export interface Response {
        result?: { [key: string]: any; };
        notification?: {
            timestamp: Date;
            instanceId: string | undefined,
            module: Modules;
            payload: any;
        };
    }

    interface Version {
        apiBuild: number;
        appBuild: number;
    }

}


