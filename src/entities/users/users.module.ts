import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersDaoService } from './dao/users-dao.service.js';
import { UsersController } from './users.controller.js';
import { SessionsDaoService } from './dao/sessions-dao.service.js';
import { usersProvider } from './dao/users.provider.js';
import { NotificationsModule } from '../../notifications/notifications.module.js';
import { UsersFirestoreService } from './users-firestore.service.js';

@Module({
  imports: [NotificationsModule],
  providers: [usersProvider, UsersService, UsersDaoService, SessionsDaoService, UsersFirestoreService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule { }
