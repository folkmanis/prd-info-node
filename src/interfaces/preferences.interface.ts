import { LogLevels } from '../lib/logger';
import { ResponseBase } from './response-base.interface';

export const MODULES = ['kastes', 'system', 'jobs'] as const;
export type Modules = typeof MODULES[number];

export type SystemPreferences = Array<SystemPreferenceModule>;

export interface SystemPreferenceModule {
    module: Modules;
    settings: KastesSystemPreference | SystemSystemPreference | JobsSystemPreference;
}

export interface KastesSystemPreference {
    colors: { [key: string]: string; },
}

export interface SystemSystemPreference {
    menuExpandedByDefault: boolean;
    logLevels: Array<LogLevels | string>[];
}

export interface ProductUnit {
    unitName: string;
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
    lastJobId: number;
    lastInvoiceId: number;
}

export interface PreferencesResponse extends ResponseBase<SystemPreferenceModule> {

}