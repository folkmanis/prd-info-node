import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { EntitiesModule } from './entities/entities.module';
import { FilesystemModule } from './filesystem/filesystem.module';
import { FtpWatcherModule } from './ftp-watcher/ftp-watcher.module';
import { GoogleModule } from './google/google.module';
import { LoggingModule } from './logging/logging.module';
import { LoginModule } from './login/login.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaytraqModule } from './paytraq/paytraq.module';
import { PreferencesModule } from './preferences/preferences.module';
import { SessionModule } from './session/session.module';
import { SessionMiddleware } from './session/session.middleware';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { NullResponseInterceptor } from './lib/null-response.interceptor';
import { dotEnvConfig } from './dot-env.config';


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
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: NullResponseInterceptor,
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware).forRoutes('*');
  }
}
