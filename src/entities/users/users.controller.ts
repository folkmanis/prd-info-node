import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  ParseArrayPipe,
  Query,
  Post,
} from '@nestjs/common';
import { Modules } from '../../login/index.js';
import { SessionsDaoService } from './dao/sessions-dao.service.js';
import { UsersDaoService } from './dao/users-dao.service.js';
import { User } from './entities/user.interface.js';
import { PasswordPipe } from './password.pipe.js';
import { PasswordDto } from './dto/password-dto.class.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { ValidateObjectKeyPipe } from '../../lib/validate-object-key.pipe.js';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor.js';
import { UsersService } from './users.service.js';
import { UserUpdateNotifyInterceptor } from './user-update-notify.interceptor.js';
import { UsersFirestoreService } from './users-firestore.service.js';

@Controller('users')
@Modules('admin')
@UsePipes(
  new ValidationPipe({ transform: true, whitelist: true }),
  PasswordPipe,
)
@UseInterceptors(UserUpdateNotifyInterceptor)
export class UsersController {
  constructor(
    private usersDao: UsersDaoService,
    private sessionsDao: SessionsDaoService,
    private usersService: UsersService,
    private usersFirestore: UsersFirestoreService,
  ) { }

  @Get('validate/:property')
  async getProperty(
    @Param('property', new ValidateObjectKeyPipe('username', 'name'))
    key: keyof User,
  ) {
    return this.usersDao.validationData(key);
  }

  @Get(':id')
  async getOne(@Param('id') username: string) {
    return this.usersService.getOneByUsername(username);
  }

  @Get()
  async getAll() {
    return this.usersDao.findAllUsers();
  }

  @Put()
  async addUser(@Body() user: User) {
    return this.usersDao.addOne(user);
  }

  @Post(':id/firestore/upload')
  @UseInterceptors(new ResponseWrapperInterceptor('updatedCount'))
  async copyToFirestore(@Param('id') username: string) {
    return this.usersFirestore.setUser(username);
  }

  @Patch(':id/password')
  async updatePassword(
    @Param('id') username: string,
    @Body() { password }: PasswordDto,
  ) {
    return this.usersDao.updateOne({
      username,
      password,
    });
  }

  @Patch(':id')
  async updateUser(@Param('id') username: string, @Body() user: UpdateUserDto) {
    const result = await this.usersService.updateUser(username, user);
    return this.usersService.getOneByUsername(result.username);
  }

  @Delete(':id/session')
  @UseInterceptors(new ResponseWrapperInterceptor('deletedCount'))
  async deleteSession(
    @Param('id') username: string,
    @Query('ids', ParseArrayPipe) sessionIds: string[],
  ) {
    return this.sessionsDao.deleteSessions(username, sessionIds);
  }

  @Delete(':id')
  @UseInterceptors(new ResponseWrapperInterceptor('deletedCount'))
  async deleteUser(@Param('id') username: string) {
    await this.usersFirestore.deleteUser(username);
    return this.usersDao.deleteUser(username);
  }
}
