import { Module } from '@nestjs/common';
import { OauthController } from './oauth/oauth.controller';
import { OauthService } from './oauth/oauth.service';
import { PreferencesModule } from '../preferences';

@Module({
  imports: [
    PreferencesModule,
  ],
  controllers: [
    OauthController
  ],
  providers: [
    OauthService
  ],
  exports: [
    OauthService
  ]
})
export class GoogleModule { }
