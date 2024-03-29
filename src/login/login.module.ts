import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../entities/users/users.module';
import { GoogleModule } from '../google/google.module';
import { SessionTokenModule } from '../session/session-token';
import { ModulesGuard } from './guards/modules.guard';
import { SessionGuard } from './guards/session.guard';
import { LocalStrategy } from './local.strategy';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { GoogleController } from './google/google.controller';
import { NotificationsModule } from '../notifications';

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
export class LoginModule {}
