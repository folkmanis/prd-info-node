import { LogLevels } from '../lib/logger';
export type Modules = 'kastes' | 'system';

export type SystemPreferences = Array<SystemPreference>
export type SystemPreference = SystemPreferenceModule<Modules>
export interface SystemPreferenceModule<T extends Modules> {
    module: T;
    settings: { [key: string]: any; };
}

export interface KastesSystemPreference extends SystemPreferenceModule<'kastes'> {
    settings: {
        colors: { [key: string]: string; },
    };

}

export interface SystemSystemPreference extends SystemPreferenceModule<'system'> {
    settings: {
        menuExpandedByDefault: true;
        logLevels: Array<LogLevels | string>[];
    };
}