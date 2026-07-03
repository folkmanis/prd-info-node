import { Injectable } from '@nestjs/common';
import { PreferencesDao } from './dao/preferencesDao.service.js';
import {
  ModuleSettings,
  PreferencesDbModules,
  PreferencesModuleNames,
} from './interfaces/system-preferences.interface.js';
import { assertCondition } from '../lib/assertions.js';

@Injectable()
export class PreferencesService {
  constructor(private preferencesDao: PreferencesDao) {}

  async getSystemPreferences<M extends PreferencesModuleNames>(
    filter: { module?: M } = {},
  ): Promise<PreferencesDbModules[]> {
    return this.preferencesDao.getAllPreferences(filter);
  }

  async getModulePreferences<M extends PreferencesModuleNames>(
    module: M,
  ): Promise<ModuleSettings<M>> {
    const settings = await this.getSystemPreferences({ module });
    assertCondition(settings[0].module === module);
    return settings[0].settings as ModuleSettings<M>;
  }

  async updatePreferences(
    update: PreferencesDbModules[],
  ): Promise<PreferencesDbModules[]> {
    await this.preferencesDao.updatePreferences(update);
    return this.getSystemPreferences();
  }
}
