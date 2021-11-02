import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SessionMiddleware } from './session.middleware';
import { userSessionMiddleware } from './user-session.middleware';
import { UsersModule } from '../entities/users';
import { SessionTokenModule } from './session-token/session-token.module';
import { sessionProvider } from './session-dao.service';
import { SessionService } from './session.service';
import { SessionDaoService } from './session-dao.service';

@Module({
  imports: [
    UsersModule,
    SessionTokenModule
  ],
  providers: [
    sessionProvider,
    SessionDaoService,
    SessionService,
  ],
  exports: [
    SessionService,
  ]
})
export class SessionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(
      SessionMiddleware,
      userSessionMiddleware
    ).forRoutes('*');
  }
}
