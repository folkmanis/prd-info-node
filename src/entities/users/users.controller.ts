import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UsePipes, ValidationPipe, UseInterceptors, ParseArrayPipe, Query, NotFoundException } from '@nestjs/common';
import { Modules } from '../../login';
import { SessionsDaoService } from './dao/sessions-dao.service';
import { UsersDaoService } from './dao/users-dao.service';
import { User } from './entities/user.interface';
import { PasswordPipe } from './password.pipe';
import { PasswordDto } from './dto/password-dto.class';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidateObjectKeyPipe } from '../../lib/validate-object-key.pipe';
import { ResponseWrapperInterceptor } from '../../lib/response-wrapper.interceptor';
import { UsersService } from './users.service';

@Controller('users')
@Modules('admin')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }), PasswordPipe)
export class UsersController {


    constructor(
        private usersDao: UsersDaoService,
        private sessionsDao: SessionsDaoService,
        private usersService: UsersService,
    ) { }

    @Get('validate/:property')
    async getProperty(
        @Param('property', new ValidateObjectKeyPipe('username', 'name')) key: keyof User,
    ) {
        return this.usersDao.validationData(key);
    }

    @Get(':id')
    async getOne(
        @Param('id') username: string
    ) {
        return this.usersService.getOne(username);
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
        const result = await this.usersDao.updateOne({ ...user, username });
        if (!result) {
            throw new NotFoundException('Invalid username');
        }
        return this.usersService.getOne(username);
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
    async deleteUser(
        @Param('id') username: string
    ) {
        return this.usersDao.deleteUser(username);
    }
}

