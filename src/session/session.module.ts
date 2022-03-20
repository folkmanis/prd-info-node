import { Module } from '@nestjs/common';
import { UsersModule } from '../entities/users';
import { SessionDaoService, sessionProvider } from './session-dao.service';
import { SessionTokenModule } from './session-token/session-token.module';
import { SessionService } from './session.service';

@Module({
  imports: [UsersModule, SessionTokenModule],
  providers: [sessionProvider, SessionDaoService, SessionService],
  exports: [SessionService],
})
export class SessionModule {}
