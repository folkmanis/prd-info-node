import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SessionMiddleware } from './session.middleware';
import { userSessionMiddleware } from './user-session.middleware';

@Module({})
export class SessionModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(SessionMiddleware, userSessionMiddleware)
            .forRoutes('*');
    }
}
