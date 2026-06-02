import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { DatabaseModule } from './database/database.module.js';
import { validate } from './dot-env.config.js';
import { EntitiesModule } from './entities/entities.module.js';
import { FilesystemModule } from './filesystem/filesystem.module.js';
import { FirebaseModule } from './firebase/firebase.module.js';
import { FtpWatcherModule } from './ftp-watcher/ftp-watcher.module.js';
import { GoogleModule } from './google/google.module.js';
import { NullResponseInterceptor } from './lib/null-response.interceptor.js';
import { ObjectIdPipe } from './lib/object-id.pipe.js';
import { ZodSerializationFilter } from './lib/zod-serialization/zod-serialization.filter.js';
import { ErrorLoggerFilter } from './logging/error-logger.filter.js';
import { LoggingModule } from './logging/logging.module.js';
import { LoginModule } from './login/login.module.js';
import { MessagesModule } from './messages/messages.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { PaytraqModule } from './paytraq/paytraq.module.js';
import { PreferencesModule } from './preferences/preferences.module.js';
import { SessionMiddleware } from './session/session.middleware.js';
import { SessionModule } from './session/session.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate,
    }),
    DatabaseModule,
    LoginModule,
    SessionModule,
    PreferencesModule,
    MessagesModule,
    NotificationsModule,
    PaytraqModule,
    LoggingModule,
    EntitiesModule,
    FilesystemModule,
    FtpWatcherModule,
    GoogleModule,
    FirebaseModule.forRoot(),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: NullResponseInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ObjectIdPipe,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ErrorLoggerFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ZodSerializationFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware).forRoutes('*');
  }
}
