import { FactoryProvider } from '@nestjs/common';
import {
  PreferencesService,
  SystemSystemPreference,
  LogLevel,
} from '../preferences';

export const logLevelsFactory: FactoryProvider = {
  provide: 'LOG_LEVELS',
  useFactory: async (
    prefService: PreferencesService,
  ): Promise<Record<LogLevel, number>> => {
    const { logLevels } = (await prefService.getModuleSystemPreferences(
      'system',
    )) as SystemSystemPreference;
    return logLevels.reduce(
      (acc, level) => ({ ...acc, [level[1]]: level[0] }),
      {} as Record<LogLevel, number>,
    );
  },
  inject: [PreferencesService],
};
