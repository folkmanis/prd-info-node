/**
 * /data/login
 * 
 * POST /data/login/login
 * {
 * username: string;
 * password: string;
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

import crypto from 'crypto';
import { Controller, Get, Post, Wrapper, ClassWrapper, Middleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import { asyncWrapper } from '../lib/asyncWrapper';
import UsersDAO from '../dao/usersDAO';
import PrdSession from '../lib/session-handler';

@Controller('data/login')
export class LoginController {

    @Post('login')
    private async login(req: Request, res: Response) {
        if (!req.body.username || !req.body.password) {  // Ja nepareizs pieprasījums
            res.status(401).json({});
            return;
        }
        await new Promise((resolve, reject) => {  // Izdzēš sesiju
            if (!req.session) { // Ja sesijas nav, tad neko nedara
                resolve();
                return;
            }
            req.session.regenerate((err) => {  // Sesijas dzēšana
                err ? reject(err) : resolve();
            });
        });

        const login = {
            username: req.body.username,
            password: crypto.createHash('sha256').update(req.body.password).digest('hex'),
        };

        let user = await UsersDAO.login(login);

        if (!user) {
            req.log.error('Login failed', req.body);
            res.status(401).json({});
            return;
        }
        if (req.session) {
            req.session.user = user;
        }
        req.log.debug('session', req.session);
        res.json(user);
    }

    @Post('logout')
    private async logout(req: Request, res: Response) {
        const result = await new Promise((resolve, reject) => {
            if (req.session) {
                req.session.destroy((err) => {
                    err ? reject(err) : resolve({ logout: 1 });
                });
            } else {
                resolve({ logout: 0 });
            }
        });
        req.log.info('User logged out', { user: req.session?.user });
        res.json(result);
    }

    @Get('user')
    private user(req: Request, res: Response) {
        req.log.debug('login/user');
        if (req.session && req.session.user) {
            res.json(req.session.user);
        }
        else {
            res.json({});
        }
    }

}
