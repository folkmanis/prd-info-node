import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SessionMiddleware } from './session.middleware';
import { userSessionMiddleware } from './user-session.middleware';
import { UsersModule } from '../users';

@Module({
  imports: [UsersModule],
})
export class SessionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware, userSessionMiddleware).forRoutes('*');
  }
}
