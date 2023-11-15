import { Module } from '@nestjs/common';
import { SessionDaoService, sessionProvider } from './session-dao.service';
import { SessionTokenModule } from './session-token/session-token.module';
import { SessionService } from './session.service';

@Module({
  imports: [SessionTokenModule],
  providers: [sessionProvider, SessionDaoService, SessionService],
  exports: [SessionService],
})
export class SessionModule {}
