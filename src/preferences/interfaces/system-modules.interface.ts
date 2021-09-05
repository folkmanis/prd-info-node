const SYSTEM_MODULES_KEYS = [
  'kastes',
  'system',
  'jobs',
  'paytraq',
  'calculations',
  'admin',
  'xmf-search',
  'xmf-upload',
  'jobs-admin',
] as const;
export const SYSTEM_MODULES: string[] = [...SYSTEM_MODULES_KEYS];
export type SystemModules = typeof SYSTEM_MODULES_KEYS[number];
