import { Controller, Post, Get, Body, Param, Session } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { Modules } from '../login';
import { SystemModules } from './interfaces/system-modules.interface';
import { PreferencesDao } from './dao/preferencesDao.service';
import { SystemPreferenceModule } from './interfaces/system-preferences.interface';

@Controller('preferences')
export class PreferencesController {

    constructor(
        private preferencesDao: PreferencesDao,
    ) { }

    @Modules('admin')
    @Post()
    async updateAll(
        @Body() preferences: SystemPreferenceModule[]
    ) {
        return this.preferencesDao.updatePreferences(...preferences);
    }

    @Get(':module')
    async getPreferences(
        @Param('module') module: SystemModules
    ) {
        return this.preferencesDao.getModulePreferences(module);
    }

    @Get()
    async getAllPreferences() {
        return this.preferencesDao.getAllPreferences();
    }


}

