import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from '../entities/users';
import { LoginService } from './login.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private loginService: LoginService) {
    super();
  }

  async validate(username: string, password: string): Promise<User | null> {
    return this.loginService.validateUser(username, password);
  }
}
