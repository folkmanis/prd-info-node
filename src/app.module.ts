import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
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

const dotEnvConfig = Joi.object({
  PORT: Joi.number().default(3000),
  SESSION_EXPIRES: Joi.number().default(86400),
  DB_SRV: Joi.string().required(),
  DB_BASE: Joi.string().required(),
  LOGFILE: Joi.string().default('./error.log'),
  BODY_SIZE_LIMIT: Joi.string().default('5mb'),
  DEBUG: Joi.boolean().truthy('1', 'Y').falsy('0', 'N'),
  JOBS_INPUT: Joi.string().required(),
  FTP_FOLDER: Joi.string().required(),
});

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
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware).forRoutes('*');
  }
}
