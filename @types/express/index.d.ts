
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
        version?: Version;
        instanceId?: string;
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
        jsonOk: (body: JsonResponse<ResBody>) => Response;
    }

    export interface JsonResponse<T> {
        insertedId?: string | number | Object;
        deletedCount?: number;
        modifiedCount?: number;
        insertedCount?: number;
        validatorData?: T[keyof T][];
        data?: T | Partial<T>[];
    }
}


interface Version {
    apiBuild: number;
    appBuild: number;
}
