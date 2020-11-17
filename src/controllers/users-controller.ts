import crypto from 'crypto';
import { Controller, Get, Post, Delete, Wrapper, ClassWrapper, ClassMiddleware, Put } from '@overnightjs/core';
import { Request, Response } from 'express';
import { User } from '../interfaces';
import { PrdSession } from '../lib/session-handler';
import { UsersDAO } from '../dao/usersDAO';
import { UsersResponse } from '../interfaces';

@Controller('data/users')
@ClassMiddleware(PrdSession.validateAdminSession)
export class UsersController {

    @Get(':id')
    private async getUser(req: Request, res: Response) {
        const username: string = req.params.id;
        req.log.info('get/user', { username });

        const result: UsersResponse = {
            error: false,
            data: await UsersDAO.getUser(username),
        };
        res.json(result);

    }

    @Get()
    private async getList(req: Request, res: Response) {
        req.log.info('users/list');
        const resp: UsersResponse = await UsersDAO.list().then(data => ({
            error: false,
            data,
        }));
        res.json(resp);
    }

    @Put()
    private async addUser(req: Request, res: Response) {
        const user: User = req.body;
        if (!user.username) { throw new Error('Username not provided'); }
        if (!user.password) { throw new Error('Password not provided'); }
        user.password = hashPassword(req.body.password);
        req.log.info('users add', req.body);

        const result = await UsersDAO.addUser(user);

        req.log.info('user added', result);
        res.json(result);
    }

    @Post(':id/password')
    private async updatePassword(req: Request, res: Response) {
        if (!req.body.password) { throw new Error('Password not set'); }

        const user = { username: req.params.id as string, password: hashPassword(req.body.password) };
        const result = await UsersDAO.updateUser(user);
        res.json(result);
        req.log.info('password updated', result);
    }

    @Post(':id')
    private async updateUser(req: Request, res: Response) {
        req.log.info('users update', req.body);
        const user: Partial<User> = { ...req.body, username: req.params.id };
        const result: UsersResponse = await UsersDAO.updateUser(user);
        req.log.info('user update', result);
        res.json(result);
    }

    @Delete(':id')
    private async deleteUser(req: Request, res: Response) {
        const username = req.params.id;
        const result = await UsersDAO.deleteUser(username);
        res.json(result);
        req.log.info('user delete', result);
    }

}

function hashPassword(passw: string): string {
    return crypto.createHash('sha256').update(passw).digest('hex');
}
