import { FactoryProvider } from '@nestjs/common';
import { PreferencesService, SystemSystemPreference } from '../preferences';

export const logLevelsFactory: FactoryProvider = {
    provide: 'LOG_LEVELS',
    useFactory: async (prefService: PreferencesService) => {
        return (await prefService.getModuleSystemPreferences('system') as SystemSystemPreference).logLevels;
    },
    inject: [PreferencesService]
};