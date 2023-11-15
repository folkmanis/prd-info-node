import { Module } from '@nestjs/common';
import { ConfigFactory, ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { FilesystemModule } from '../filesystem';
import { PreferencesModule } from '../preferences';
import { GmailController } from './gmail/gmail.controller';
import { Oauth2Service } from './oauth2/oauth2.service';
import { HttpModule } from '@nestjs/axios';

const googleConfig: ConfigFactory = async () => {
  const oAuthLocation = process.env.GOOGLE_OAUTH2_CREDENTIALS || '';
  const oAuthRedirect = process.env.GOOGLE_OAUTH2_REDIRECT || '';

  const oAuth2 = JSON.parse(
    await readFile(resolve(oAuthLocation), { encoding: 'utf8' }),
  );
  return {
    google: {
      oAuthLocation,
      oAuthRedirect,
      scopes: ['https://mail.google.com/', 'profile'],
      web: oAuth2.web,
    },
  };
};

@Module({
  imports: [
    ConfigModule.forFeature(googleConfig),
    PreferencesModule,
    FilesystemModule,
    HttpModule,
    JwtModule.register({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      secretOrKeyProvider: () => process.env.JWT_SECRET!,
      signOptions: {
        expiresIn: '5m',
      },
    }),
  ],
  controllers: [GmailController],
  providers: [Oauth2Service],
  exports: [Oauth2Service],
})
export class GoogleModule {}
