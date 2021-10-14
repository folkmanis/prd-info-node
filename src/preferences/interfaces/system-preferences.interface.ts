import { SystemModules } from './system-modules.interface';

export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

export type AppLogLevels = Record<LogLevel, number>;

export type SystemPreference =
  | KastesSystemPreference
  | SystemSystemPreference
  | JobsSystemPreference
  | PaytraqSystemPreference;

export interface SystemPreferenceModule {
  module: SystemModules;
  settings: SystemPreference;
}

export interface KastesSystemPreference {
  colors: { [key: string]: string; };
}

export interface SystemSystemPreference {
  menuExpandedByDefault: boolean;
  logLevels: [number, LogLevel][];
}

export interface ProductUnit {
  shortName: string;
  description: string;
  disabled: boolean;
}

export interface JobsSystemPreference {
  productCategories: {
    category: string;
    description: string;
  }[];
  jobStates: {
    state: number;
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
