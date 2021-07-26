
declare namespace Express {


    export interface Request {
        userPreferences?: {
            customers: string[],
            modules: string[],
        };
        log: {
            debug: (message: string, metadata?: any) => void,
            info: (message: string, metadata?: any) => void,
            error: (message: string, metadata?: any) => void,
        };
        systemPreferences?: Map<string, { [key: string]: any; }>;
        version?: Version;
    }

    type Modules = 'kastes' | 'system' | 'jobs' | 'paytraq' | 'calculations' | 'admin' | 'xmf-search' | 'xmf-upload';

    export interface Response {
        result?: { [key: string]: any; };
        message?: {
            timestamp: Date;
            module: Modules;
        };
    }

    interface Version {
        apiBuild: number;
        appBuild: number;
    }

}


