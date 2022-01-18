import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SessionTokenEntity } from './session-token.entity';
import { Session } from 'express-session';
import { User } from '../../entities/users';

@Injectable()
export class SessionTokenService {
  constructor(private readonly jwtService: JwtService) {}

  token(session: Session, instanceId: string, user: User): string {
    const token: SessionTokenEntity = {
      sessionId: session.id,
      inst: instanceId,
      userId: user.username,
      modules: user.preferences.modules,
    };
    return this.jwtService.sign(token);
  }

  verify(token: string): SessionTokenEntity {
    return this.jwtService.verify(token);
  }
}
