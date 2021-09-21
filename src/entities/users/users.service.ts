import { Injectable } from '@nestjs/common';
import { User } from './entities/user.interface';
import { UsersDaoService } from './dao/users-dao.service';

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

}
