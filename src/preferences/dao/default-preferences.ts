import { SystemPreferenceModule } from '../interfaces/system-preferences.interface.js';

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
      logLevels: [
        [5, 'debug'],
        [0, 'error'],
        [2, 'info'],
        [6, 'silly'],
        [4, 'verbose'],
        [1, 'warn'],
        [3, 'http'],
      ],
      hostname: 'http://localhost',
      shippingAddress: null,
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
    settings: { enabled: false, connectionParams: null },
  },
  {
    module: 'transportation',
    settings: {
      fuelTypes: [
        { type: 'gasoline', description: 'Benzīns', units: 'l' },
        { type: 'diesel', description: 'Dīzelis', units: 'l' },
        { type: 'electric', description: 'Elektrība', units: 'kWh' },
      ],
      shippingAddress: null,
    },
  },
];
