import { Injectable } from '@nestjs/common';
import { User, ModuleUserPreferences } from './entities/user.interface';
import { UsersDaoService } from './dao/users-dao.service';
import { SystemModules } from '../../preferences';

@Injectable()
export class UsersService {

  constructor(
    private usersDao: UsersDaoService,
  ) { }

  async getOne(username: string): Promise<User | undefined> {
    return this.usersDao.getOne(username);
  }

  async login(username: string, password: string): Promise<User | null> {
    return this.usersDao.login(username, password);
  }

  async getModulePreferences(username: string, module: SystemModules): Promise<ModuleUserPreferences> {
    return this.usersDao.getModuleUserPreferences(username, module);
  }

  async setModulePreferences(username: string, module: SystemModules, preferences: ModuleUserPreferences): Promise<ModuleUserPreferences> {
    await this.usersDao.updateModuleUserPreferences(username, module, preferences);
    return this.getModulePreferences(username, module);
  }

}
