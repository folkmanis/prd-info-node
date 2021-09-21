import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { Modules } from '../../login';
import { SessionsDaoService } from './dao/sessions-dao.service';
import { UsersDaoService } from './dao/users-dao.service';
import { User } from './entities/user.interface';
import { PasswordPipe } from './password.pipe';
import { PasswordDto } from './dto/password-dto.class';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@Modules('admin')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }), PasswordPipe)
export class UsersController {


    constructor(
        private usersDao: UsersDaoService,
        private sessionsDao: SessionsDaoService,
    ) { }

    @Get(':id')
    async getOne(@Param('id') username: string) {
        return this.usersDao.getOne(username);
    }

    @Get()
    async getAll() {
        return this.usersDao.findAllUsers();
    }

    @Put()
    async addUser(
        @Body() user: User
    ) {
        return this.usersDao.addOne(user);
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
    async updateUser(
        @Param('id') username: string,
        @Body() user: UpdateUserDto,
    ) {
        return this.usersDao.updateOne({ ...user, username });
    }

    @Delete('session/:sessionId')
    async deleteSession(
        @Param('sessionId') sessionId: string
    ) {
        return this.sessionsDao.deleteSession(sessionId);
    }

    @Delete(':id')
    async deleteUser(
        @Param('id') username: string
    ) {
        return this.usersDao.deleteUser(username);
    }
}

