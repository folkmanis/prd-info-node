import { Module } from '@nestjs/common';
import { SessionDaoService, sessionProvider } from './session-dao.service.js';
import { SessionTokenModule } from './session-token/session-token.module.js';
import { SessionService } from './session.service.js';

@Module({
  imports: [SessionTokenModule],
  providers: [sessionProvider, SessionDaoService, SessionService],
  exports: [SessionService],
})
export class SessionModule { }
