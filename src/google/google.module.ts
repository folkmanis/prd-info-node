import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigFactory, ConfigModule } from '@nestjs/config';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { PreferencesModule } from '../preferences';
import { GmailController } from './gmail/gmail.controller';
import { GoogleAuthMiddleware } from './google-auth.middleware';
import { FilesystemModule } from '../filesystem';

const googleConfig: ConfigFactory = async () => {
  const credentialsLocation = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
  const scope = process.env.GOOGLE_API_SCOPE;
  if (!credentialsLocation || !scope) {
    return null;
  }
  const account = JSON.parse(await readFile(resolve(credentialsLocation), { encoding: 'utf8' }));
  return {
    google: {
      credentialsLocation,
      scope,
      account,
    }
  };
};



@Module({
  imports: [
    ConfigModule.forFeature(googleConfig),
    PreferencesModule,
    FilesystemModule,
  ],
  controllers: [
    GmailController
  ],
  providers: [
  ],
  exports: [
  ]
})
export class GoogleModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GoogleAuthMiddleware)
      .forRoutes(GmailController);
  }
}
