/**
 * /data/login
 * 
 * POST /data/login/login
 * {
 * username: string;
 * pass: string;
 * }
 * 
 * User
 * 
 * 
 * POST /data/login/logout
 * {}
 * 
 * GET /data/login/user
 * export interface User {
 *   id: number;
 *   username: string;
 *   name: string;
 *   admin: boolean;
 *   lastlogin?: Date;
 * } | {}
 *
 */

import { Controller, Get, Post, Wrapper, ClassWrapper } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import { Request, Response } from 'express';
import { asyncQuery } from '../lib/mysql-connector';
import { asyncWrapper } from "../lib/asyncWrapper";
import { User } from './users-controller';

@Controller('data/login')
export class LoginController {

    @Post('login')
    @Wrapper(asyncWrapper)
    private async login(req: Request, res: Response) {
        await new Promise((resolve, reject) => {  // Izdzēš sesiju
            if (!req.session) { // Ja sesijas nav, tad neko nedara
                resolve();
                return;
            }
            req.session.regenerate((err) => {  // Sesijas dzēšana
                err ? reject(err) : resolve()
            })
        })
        const q = `SELECT id, name, username, admin FROM users WHERE username=? AND password=UNHEX(SHA(?))`;
        const result = await asyncQuery<User[]>(req.sqlConnection, q, [req.body.username, req.body.pass]);
        if (result.length < 1) {
            Logger.Err('Login failed. User: ' + req.body.username + ' pwd: ' + req.body.pass);
            res.status(401).json({});
        } else if (req.session) {
            req.session.user = result[0];
            await asyncQuery(req.sqlConnection, `UPDATE users SET last_login=UTC_TIMESTAMP() WHERE id=?`, [result[0].id]);
            Logger.Info('Logged in. User: ' + req.session.user.username);
            res.json(req.session.user);
        }
    }

    @Post('logout')
    @Wrapper(asyncWrapper)
    private async logout(req: Request, res: Response) {
        Logger.Info('logout');
        const result = await new Promise((resolve, reject) => {
            if (req.session) {
                req.session.destroy((err) => {
                    err ? reject(err) : resolve({ affectedRows: 1 });
                })
            } else {
                resolve({ affectedRows: 0 });
            }
        });
        res.json(result);
    }

    @Get('user')
    private user(req: Request, res: Response) {
        if (req.session && req.session.user) {
            res.json(req.session.user);
        }
        else {
            res.json({});
        }
    }

}
