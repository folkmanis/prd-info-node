import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigFactory, ConfigModule } from '@nestjs/config';
import { PreferencesModule } from '../preferences';
import { GmailController } from './gmail/gmail.controller';
import { OauthController } from './oauth/oauth.controller';
import { OauthService } from './oauth/oauth.service';
import { GoogleAuthService } from './google-auth.service';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { GoogleAuthMiddleware } from './google-auth.middleware';

const googleConfig: ConfigFactory = async () => {
  const credentialsLocation = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
  const account = JSON.parse(await readFile(resolve(credentialsLocation), { encoding: 'utf8' }));
  return {
    google: {
      credentialsLocation,
      scope: process.env.GOOGLE_API_SCOPE,
      account,
    }
  };
};



@Module({
  imports: [
    ConfigModule.forFeature(googleConfig),
    PreferencesModule,
  ],
  controllers: [
    OauthController,
    GmailController
  ],
  providers: [
    GoogleAuthService,
    OauthService,
  ],
  exports: [
    OauthService
  ]
})
export class GoogleModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GoogleAuthMiddleware)
      .forRoutes(GmailController);
  }
}
