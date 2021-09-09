import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersDaoService } from './dao/users-dao.service';
import { UsersController } from './users.controller';
import { SessionsDaoService } from './dao/sessions-dao.service';

@Module({
  providers: [
    UsersService,
    UsersDaoService,
    SessionsDaoService,
  ],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule { }
