import crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { User, UsersService } from '../users';

@Injectable()
export class LoginService {
  constructor(private usersService: UsersService) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    return this.usersService.login(
      username,
      crypto.createHash('sha256').update(password).digest('hex'),
    );
  }
}
