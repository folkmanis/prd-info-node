import { Injectable } from '@nestjs/common';
import { UsersService, UserPreferences } from '../users';
import { PreferencesDao } from './dao/preferencesDao.service';
import {
  SystemPreferenceModule,
  SystemPreference,
} from './interfaces/system-preferences.interface';
import { SystemModules } from './interfaces/system-modules.interface';

@Injectable()
export class PreferencesService {
  constructor(
    private usersService: UsersService,
    private preferencesDao: PreferencesDao,
  ) {}

  async getUserPreferences(username: string): Promise<UserPreferences> {
    const user = await this.usersService.getOne(username);
    if (!user) {
      throw new Error('Invalid username');
    }
    return user.preferences;
  }

  async getSystemPreferences(): Promise<SystemPreferenceModule[]> {
    return this.preferencesDao.getAllPreferences();
  }

  async getModuleSystemPreferences(
    module: SystemModules,
  ): Promise<SystemPreference> {
    return this.preferencesDao.getModulePreferences(module);
  }
}
