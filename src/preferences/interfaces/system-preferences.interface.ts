import { z } from 'zod';
import { JobsSettingsSchema } from './module-settings/job-settings.js';
import { KastesSettingsSchema } from './module-settings/kastes-settings.js';
import { PaytraqSettingsSchema } from './module-settings/paytraq-settings.js';
import { SystemSettingsSchema } from './module-settings/system-settings.js';
import { TransportationSettingsSchema } from './module-settings/transportation-settings.js';

const PreferencesSettings = {
  system: SystemSettingsSchema,
  kastes: KastesSettingsSchema,
  jobs: JobsSettingsSchema,
  paytraq: PaytraqSettingsSchema,
  transportation: TransportationSettingsSchema,
} as const;

export const PreferencesSettingsSchema = z.object(PreferencesSettings);

export const PreferencesDbModulesSchema = z.discriminatedUnion('module', [
  z.object({
    module: z.literal('system'),
    settings: PreferencesSettings['system'],
  }),
  z.object({
    module: z.literal('kastes'),
    settings: PreferencesSettings['kastes'],
  }),
  z.object({
    module: z.literal('jobs'),
    settings: PreferencesSettings['jobs'],
  }),
  z.object({
    module: z.literal('paytraq'),
    settings: PreferencesSettings['paytraq'],
  }),
  z.object({
    module: z.literal('transportation'),
    settings: PreferencesSettings['transportation'],
  }),
]);
export type PreferencesDbModules = z.infer<typeof PreferencesDbModulesSchema>;

export const MODULES = PreferencesDbModulesSchema.options.map(
  (obj) => obj.shape.module.value,
);
export const PreferencesModuleNamesSchema = z.enum(MODULES);
export type PreferencesModuleNames = z.infer<
  typeof PreferencesModuleNamesSchema
>;

export type ModuleSettings<M extends PreferencesModuleNames> =
  Extract<PreferencesDbModules, { module: M }> extends { settings: infer S }
    ? S
    : never;
type jjj = ModuleSettings<'jobs'>;

export const preferencesObjectToDbArray = z.codec(
  PreferencesSettingsSchema,
  PreferencesDbModulesSchema.array(),
  {
    encode: (value) => {
      return Object.assign(
        {},
        ...value.map((mod) => ({ [mod.module]: mod.settings })),
      );
    },
    decode: (value) => {
      return MODULES.map((module) => ({
        module,
        settings: value[module],
      })) as PreferencesDbModules[];
    },
  },
);
