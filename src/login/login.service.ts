import crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { User, UsersService } from '../entities/users/index.js';

@Injectable()
export class LoginService {
  constructor(private usersService: UsersService) { }

  async validateUser(username: string, password: string): Promise<User> {
    return this.usersService.login({
      username,
      password: crypto.createHash('sha256').update(password).digest('hex'),
    });
  }

  async validateEmail(email: string) {
    return this.usersService.getOneByEmail(email);
  }

  async validateGoogleId(googleId: string): Promise<User> {
    return this.usersService.login({ googleId });
  }
}
