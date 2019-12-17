/**
 * Users administration
 *
 * GET /list
 * Full list of users
 * count: number total count
 * users: {id, username, name, admin, last_login}[]
 * 
 * GET /user?username=<string>
 * Get single user
 * { username, name, admin, preferences: UserPreferences, last_login }
 * 
 * POST /add
 * POST /update
 * Add | Update user
 *  {
 *   username: string,
 *   name: string,
 *   password: string,
 *   admin: boolean,
 *   last_login: Date,
 *  }
 * 
 * POST /password
 * Update password
 * { password: string, }
 */

import crypto from 'crypto';
import { Controller, Get, Post, Wrapper, ClassWrapper, ClassMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import { User } from '../lib/user-class';
import PrdSession from '../lib/session-handler';
import UsersDAO from '../dao/usersDAO';


@Controller('data/users')
@ClassMiddleware(PrdSession.validateAdminSession)
export class UsersController {

    @Get('list')
    private async getList(req: Request, res: Response) {
        req.log.info('users/list');
        const count = await UsersDAO.total();
        const users = await UsersDAO.list();
        res.json({ count, users });
    }

    @Get('user')
    private async getUser(req: Request, res: Response) {
        if (!req.query.username) {
            res.status(404).json(new Error('Request empty'));
        }
        const username: string = req.query.username;
        req.log.info('get/user', { username });
        const result = await UsersDAO.getUser(username);
        res.json(result);

    }

    @Post('add')
    private async addUser(req: Request, res: Response) {
        req.log.info('users add', req.body);
        const user: User = req.body;
        user.password = hashPassword(req.body.password);

        const result = await UsersDAO.addUser(user);

        req.log.info('user added', result);
        res.json(result);
    }

    @Post('update')
    private async updateUser(req: Request, res: Response) {
        req.log.info('users update', req.body);
        const user: Partial<User> = req.body;
        const result = await UsersDAO.updateUser(user);
        req.log.info('user update', result);
        res.json(result);
    }

    @Post('password')
    private async updatePassword(req: Request, res: Response) {
        req.log.info('password update', req.body);
        if (!req.body.password || !req.body.username) {
            res.status(404).json(new Error('Password not set'));
            return;
        }
        const user = { username: req.body.username as string, password: hashPassword(req.body.password) };
        const result = UsersDAO.updateUser(user);
        req.log.info('password updated', result);
        res.json(result);
    }

}

function hashPassword(passw: string): string {
    return crypto.createHash('sha256').update(passw).digest('hex');
}
