import { Injectable, NotFoundException } from '@nestjs/common';
import { SystemModules } from '../../preferences';
import { SessionsDaoService } from './dao/sessions-dao.service';
import { LoginCredentials, UsersDaoService } from './dao/users-dao.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ModuleUserPreferences, User } from './entities/user.interface';
import { assertUser } from '../../lib/assertions';

@Injectable()
export class UsersService {

  constructor(
    private usersDao: UsersDaoService,
    private sessionsDao: SessionsDaoService,
  ) { }

  async getOneByUsername(username: string): Promise<User> {
    const user = await this.usersDao.getOne({ username });
    assertUser(user);
    const sessions = await this.sessionsDao.userSessions(username);
    return {
      ...user,
      sessions,
    };
  }

  async getOneByEmail(email: string): Promise<User> {
    const user = await this.usersDao.getOne({ 'preferences.eMail': email });
    assertUser(user);
    return user;
  }

  async updateUser(username: string, update: UpdateUserDto): Promise<User> {
    const user = await this.usersDao.updateOne({ ...update, username });
    assertUser(user, 'Invalid username');
    return user;
  }

  async getSessionUser(username: string) {
    const user = await this.usersDao.getOneSessionUser(username);
    assertUser(user);
    return user;
  }

  async login(credentials: LoginCredentials): Promise<User> {
    const user = await this.usersDao.login(credentials);
    assertUser(user);
    return user;
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

