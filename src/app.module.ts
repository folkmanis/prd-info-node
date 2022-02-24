import { Module } from '@nestjs/common';
import { ConfigModule, ConfigFactory } from '@nestjs/config';
import Joi from 'joi';
import { DatabaseModule } from './database/database.module';
import { EntitiesModule } from './entities/entities.module';
import { FilesystemModule } from './filesystem/filesystem.module';
import { FtpWatcherModule } from './ftp-watcher/ftp-watcher.module';
import { LoggingModule } from './logging/logging.module';
import { LoginModule } from './login/login.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaytraqModule } from './paytraq/paytraq.module';
import { PreferencesModule } from './preferences/preferences.module';
import { SessionModule } from './session/session.module';
import { GoogleModule } from './google/google.module';
import { readFile } from 'fs/promises';
import { plainToClass } from 'class-transformer';
import { validate, validateOrReject } from 'class-validator';
import { OAuth2Credentials } from './google/oauth/interfaces/oauth2-credentials.class';

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

const googleConfig: ConfigFactory = async () => {
  try {
    const location = process.env.GOOGLE_API_CREDENTIALS_FILE || '';
    const { installed } = JSON.parse(await readFile(location, { encoding: 'utf8' }));
    const oAuth2 = plainToClass(OAuth2Credentials, installed);
    await validateOrReject(oAuth2, { whitelist: true });
    return { oAuth2 };

  } catch (error) {
    console.error(error);
    return { oAuth2: undefined };
  }
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [googleConfig],
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
export class AppModule { }
