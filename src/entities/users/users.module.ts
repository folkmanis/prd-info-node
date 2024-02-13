import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersDaoService } from './dao/users-dao.service';
import { UsersController } from './users.controller';
import { SessionsDaoService } from './dao/sessions-dao.service';
import { usersProvider } from './dao/users.provider';
import { NotificationsModule } from '../../notifications/notifications.module';
import { UsersFirestoreService } from './users-firestore.service';

@Module({
  imports: [NotificationsModule],
  providers: [usersProvider, UsersService, UsersDaoService, SessionsDaoService, UsersFirestoreService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule { }
