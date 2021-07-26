import { LogLevels } from '../lib/logger';
import { ResponseBase } from './response-base.interface';

const MODULES_KEYS = ['kastes', 'system', 'jobs', 'paytraq', 'calculations', 'admin', 'xmf-search', 'xmf-upload'] as const;
export const MODULES: string[] = [...MODULES_KEYS];
export type Modules = typeof MODULES_KEYS[number];

export type SystemPreferences = Array<SystemPreferenceModule>;

export interface SystemPreferenceModule {
    module: Modules;
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


export interface PreferencesResponse extends ResponseBase<SystemPreferenceModule> {

}