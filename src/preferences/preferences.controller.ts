import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { Modules } from '../login';
import { PreferencesDao } from './dao/preferencesDao.service';
import { SystemModules } from './interfaces/system-modules.interface';
import { SystemPreferenceModule } from './interfaces/system-preferences.interface';

@Controller('preferences')
export class PreferencesController {
  constructor(private preferencesDao: PreferencesDao) {}

  @Modules('admin')
  @Patch()
  async updateAll(@Body() preferences: SystemPreferenceModule[]) {
    return this.preferencesDao.updatePreferences(...preferences);
  }

  @Get(':module')
  async getPreferences(@Param('module') module: SystemModules) {
    return this.preferencesDao.getModulePreferences(module);
  }

  @Get()
  async getAllPreferences() {
    return this.preferencesDao.getAllPreferences();
  }
}
