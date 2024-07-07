import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module.js';
import { EntitiesModule } from './entities/entities.module.js';
import { FilesystemModule } from './filesystem/filesystem.module.js';
import { FtpWatcherModule } from './ftp-watcher/ftp-watcher.module.js';
import { GoogleModule } from './google/google.module.js';
import { LoggingModule } from './logging/logging.module.js';
import { LoginModule } from './login/login.module.js';
import { MessagesModule } from './messages/messages.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { PaytraqModule } from './paytraq/paytraq.module.js';
import { PreferencesModule } from './preferences/preferences.module.js';
import { SessionModule } from './session/session.module.js';
import { SessionMiddleware } from './session/session.middleware.js';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { NullResponseInterceptor } from './lib/null-response.interceptor.js';
import { dotEnvConfig } from './dot-env.config.js';
import { FirebaseModule } from './firebase/firebase.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: dotEnvConfig,
      cache: true,
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
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware).forRoutes('*');
  }
}
