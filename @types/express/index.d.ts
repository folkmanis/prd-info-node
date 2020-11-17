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
    interface Response {
        result: { [key: string]: any; };
    }
    interface Version {
        apiBuild: number;
        appBuild: number;
    }
}
