import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigFactory, ConfigModule } from '@nestjs/config';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { PreferencesModule } from '../preferences';
import { GmailController } from './gmail/gmail.controller';
import { FilesystemModule } from '../filesystem';
import { Oauth2Service } from './oauth2/oauth2.service';

const googleConfig: ConfigFactory = async () => {

  const oAuthLocation = process.env.GOOGLE_OAUTH2_CREDENTIALS || '';
  const oAuthRedirect = process.env.GOOGLE_OAUTH2_REDIRECT || '';

  const oAuth2 = JSON.parse(
    await readFile(resolve(oAuthLocation), { encoding: 'utf8' })
  );
  return {
    google: {
      oAuthLocation,
      oAuthRedirect,
      scopes: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/gmail.readonly',
      ],
      web: oAuth2.web,
    },
  };
};

@Module({
  imports: [
    ConfigModule.forFeature(googleConfig),
    PreferencesModule,
    FilesystemModule,
    JwtModule.register({
      secret: 'PvZHmtH9Spp8VVKbRL8m',
      signOptions: {
        expiresIn: '5m'
      }
    }),
  ],
  controllers: [
    GmailController
  ],
  providers: [
    Oauth2Service,
  ],
  exports: [
    Oauth2Service,
  ],
})
export class GoogleModule { }
