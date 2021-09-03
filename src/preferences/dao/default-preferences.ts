import { LogLevels, SystemPreferences } from '../interfaces/system-preferences.interface';

export const DEFAULT_PREFERENCES: SystemPreferences = [
    {
        module: 'kastes',
        settings: {
            colors: {
                yellow: 'hsl(45,75%,50%)',
                rose: 'hsl(315,75%,50%)',
                white: 'hsl(0,0%,50%)',
            }
        }
    },
    {
        module: 'system',
        settings: {
            menuExpandedByDefault: true,
            logLevels: [
                [LogLevels.DEBUG, 'Debug'],
                [LogLevels.ERROR, 'Error'],
                [LogLevels.INFO, 'Info'],
                [LogLevels.SILLY, 'Silly'],
                [LogLevels.VERBOSE, 'Verbose'],
                [LogLevels.WARN, 'Warning'],
            ]
        }
    },
    {
        module: 'jobs',
        settings: {
            productCategories: [
                {
                    category: 'plates',
                    description: 'Iespiedformas',
                }, {
                    category: 'perforated paper',
                    description: 'Perforētais papīrs',
                }
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
                }
            ],
            productUnits: [],
        }
    },
    {
        module: 'paytraq',
        settings: { enabled: false }
    }
];

