import { SystemModules } from './system-modules.interface';

export enum LogLevels {
    ERROR = 10, WARN = 20, INFO = 30, VERBOSE = 40, DEBUG = 50, SILLY = 60
}


export type SystemPreferences = Array<SystemPreferenceModule>;

export interface SystemPreferenceModule {
    module: SystemModules;
    settings: KastesSystemPreference | SystemSystemPreference | JobsSystemPreference | PaytraqSystemPreference;
}

export interface KastesSystemPreference {
    colors: { [key: string]: string; },
}

export interface SystemSystemPreference {
    menuExpandedByDefault: boolean;
    logLevels: Array<LogLevels | string>[];
}

export interface ProductUnit {
    shortName: string;
    description: string;
    disabled: boolean;
}

export interface JobsSystemPreference {
    productCategories:
    {
        category: string,
        description: string,
    }[];
    jobStates: {
        state: number,
        description: string;
    }[];
    productUnits: ProductUnit[];
}

export interface PaytraqSystemPreference {
    enabled: boolean;
    connectionParams?: PaytraqConnectionParams;
}

export interface PaytraqConnectionParams {
    connectUrl: string;
    connectKey: string;
    apiUrl: string;
    apiKey: string;
    apiToken: string;
}
