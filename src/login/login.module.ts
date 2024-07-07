import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../entities/users/users.module.js';
import { GoogleModule } from '../google/google.module.js';
import { SessionTokenModule } from '../session/session-token/index.js';
import { ModulesGuard } from './guards/modules.guard.js';
import { SessionGuard } from './guards/session.guard.js';
import { LocalStrategy } from './local.strategy.js';
import { LoginController } from './login.controller.js';
import { LoginService } from './login.service.js';
import { GoogleController } from './google/google.controller.js';
import { NotificationsModule } from '../notifications/index.js';

@Module({
  controllers: [GoogleController, LoginController],
  imports: [
    UsersModule,
    PassportModule,
    SessionTokenModule,
    GoogleModule,
    NotificationsModule,
  ],
  providers: [
    LoginService,
    LocalStrategy,
    {
      provide: APP_GUARD,
      useClass: SessionGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ModulesGuard,
    },
  ],
})
export class LoginModule { }
