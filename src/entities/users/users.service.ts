import { Injectable, NotFoundException } from '@nestjs/common';
import { User, ModuleUserPreferences } from './entities/user.interface';
import { UsersDaoService, LoginCredentials } from './dao/users-dao.service';
import { SystemModules } from '../../preferences';
import { SessionsDaoService } from './dao/sessions-dao.service';
import { oauth2_v2 } from 'googleapis';

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

  async setGoogleUser(username: string, googleUser: oauth2_v2.Schema$Userinfo | null): Promise<User> {
    const user = await this.usersDao.updateOne({
      username,
      google: googleUser,
    });
    assertUser(user);
    return user;
  }

  async getSessionUser(username: string) {
    const user = await this.usersDao.getOneSessionUser(username);
    assertUser(user);
    return user;
  }

  async login(credentials: LoginCredentials): Promise<User | null> {
    return this.usersDao.login(credentials);
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

function assertUser(user: User | undefined | null, message = 'Invalid username'): asserts user is User {
  if (!user) {
    throw new NotFoundException(message);
  }
}
