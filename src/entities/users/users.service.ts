import { Injectable, NotFoundException } from '@nestjs/common';
import { User, ModuleUserPreferences } from './entities/user.interface';
import { UsersDaoService } from './dao/users-dao.service';
import { SystemModules } from '../../preferences';
import { SessionsDaoService } from './dao/sessions-dao.service';

@Injectable()
export class UsersService {
  constructor(
    private usersDao: UsersDaoService,
    private sessionsDao: SessionsDaoService,
  ) {}

  async getOne(username: string): Promise<User> {
    const user = await this.usersDao.getOne(username);
    if (!user) {
      throw new NotFoundException('Invalid username');
    }
    const sessions = await this.sessionsDao.userSessions(username);
    return {
      ...user,
      sessions,
    };
  }

  async login(username: string, password: string): Promise<User | null> {
    return this.usersDao.login(username, password);
  }

  async getModulePreferences(
    username: string,
    module: SystemModules,
  ): Promise<ModuleUserPreferences> {
    return this.usersDao.getModuleUserPreferences(username, module);
  }

  async setModulePreferences(
    username: string,
    module: SystemModules,
    preferences: ModuleUserPreferences,
  ): Promise<ModuleUserPreferences> {
    await this.usersDao.updateModuleUserPreferences(
      username,
      module,
      preferences,
    );
    return this.getModulePreferences(username, module);
  }
}
