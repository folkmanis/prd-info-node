import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersDaoService } from './dao/users-dao.service';
import { UsersController } from './users.controller';
import { SessionsDaoService } from './dao/sessions-dao.service';
import { usersProvider } from './dao/users.provider';

@Module({
  providers: [usersProvider, UsersService, UsersDaoService, SessionsDaoService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule { }
