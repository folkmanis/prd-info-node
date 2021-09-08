import { SystemPreferenceModule, } from '../interfaces/system-preferences.interface';

export const DEFAULT_PREFERENCES: SystemPreferenceModule[] = [
  {
    module: 'kastes',
    settings: {
      colors: {
        yellow: 'hsl(45,75%,50%)',
        rose: 'hsl(315,75%,50%)',
        white: 'hsl(0,0%,50%)',
      },
    },
  },
  {
    module: 'system',
    settings: {
      menuExpandedByDefault: false,
      logLevels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6
      },
    },
  },
  {
    module: 'jobs',
    settings: {
      productCategories: [
        {
          category: 'plates',
          description: 'Iespiedformas',
        },
        {
          category: 'perforated paper',
          description: 'Perforētais papīrs',
        },
      ],
      jobStates: [
        {
          state: 10,
          description: 'Sagatavošana',
        },
        {
          state: 20,
          description: 'Ražošana',
        },
        {
          state: 30,
          description: 'Gatavs',
        },
        {
          state: 50,
          description: 'Izrakstīts',
        },
      ],
      productUnits: [],
    },
  },
  {
    module: 'paytraq',
    settings: { enabled: false },
  },
];
