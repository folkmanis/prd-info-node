/**
 * Users administration
 *
 * GET /list
 * Full list of users
 * count: number total count
 * users: {id, username, name, admin, last_login}[]
 */

import { Controller, Get, Post, Wrapper, ClassWrapper } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import { Request, Response } from 'express';
import { asyncQuery, MysqlPool } from '../lib/mysql-connector';
import { asyncWrapper } from "../lib/asyncWrapper";

export interface User {
    id: number;
    username: string;
    name: string;
    admin: boolean;
    lastlogin?: Date;
}

@Controller('data/users')
@ClassWrapper(asyncWrapper)
export class UsersController {

    @Get('list')
    private async getList(req: Request, res: Response) {
        Logger.Info('users/list');
        res.result = {};
        res.result.count = +(await asyncQuery<{count: number}[]>(req.sqlConnection, `SELECT COUNT(*) AS count FROM users`))[0].count;
        res.result.users = await asyncQuery<User[]>(req.sqlConnection, `SELECT id, username, name, admin, last_login FROM users ORDER BY username`);
        res.json(res.result);
    }

}
