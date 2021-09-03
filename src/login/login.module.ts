import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from './local.strategy';
import { APP_GUARD } from '@nestjs/core';
import { LoginGuard } from './login.guard';

@Module({
  controllers: [
    LoginController,
  ],
  imports: [
    UsersModule,
    PassportModule,
  ],
  providers: [
    LoginService,
    LocalStrategy,
    {
      provide: APP_GUARD,
      useClass: LoginGuard,
    }
  ],
})
export class LoginModule { }
