/**
 * Users administration
 *
 * GET /list
 * Full list of users
 * count: number total count
 * users: {id, username, name, admin, last_login}[]
 * 
 * POST /user
 * Update/insert user
 *  {
 *   username: string,
 *   name: string,
 *   password: string,
 *   admin: boolean,
 *   last_login: Date,
 *  }
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
        console.log('users/list');
        const count = await UsersDAO.total();
        const users = await UsersDAO.list();
        res.json({ count, users });
    }

    @Post('adduser')
    private async postUser(req: Request, res: Response) {
        console.log('users/update');
        const user: User = req.body;
        user.password = crypto.createHash('sha256').update(req.body.password).digest('hex');

        const result = await UsersDAO.addUser(user);

        console.log(result);
        res.json(result);
    }

}
