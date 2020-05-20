import { LogLevels } from '../lib/logger';
import { ResponseBase } from './response-base.interface';

export type Modules = 'kastes' | 'system' | 'jobs';

export type SystemPreferences = Array<SystemPreferenceModule>;
export type SystemPreferencesMap = Map<Modules, KastesSystemPreference | SystemSystemPreference | JobsSystemPreference>;

// export type SystemPreference<T> = SystemPreferenceModule<Modules>;

export interface SystemPreferenceModule {
    module: Modules;
    settings: KastesSystemPreference | SystemSystemPreference | JobsSystemPreference;
}

export interface KastesSystemPreference {
    colors: { [key: string]: string; },
}

export interface SystemSystemPreference {
    menuExpandedByDefault: true;
    logLevels: Array<LogLevels | string>[];
}

export interface JobsSystemPreference {
    productCategories:
    {
        category: string,
        description: string,
    }[];
    lastJobId: number;
    lastInvoiceId: number;
}

export interface PreferencesResponse extends ResponseBase<SystemPreferenceModule> {

}