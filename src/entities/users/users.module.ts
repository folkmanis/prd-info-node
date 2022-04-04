import { MiddlewareConsumer, Module, NestModule, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersDaoService } from './dao/users-dao.service';
import { UsersController } from './users.controller';
import { SessionsDaoService } from './dao/sessions-dao.service';
import { usersProvider } from './dao/users.provider';
import { NotificationsModule } from '../../notifications/notifications.module';

@Module({
  imports: [
    NotificationsModule,
  ],
  providers: [
    usersProvider,
    UsersService,
    UsersDaoService,
    SessionsDaoService
  ],
  exports: [
    UsersService
  ],
  controllers: [
    UsersController
  ],
})
export class UsersModule { }
