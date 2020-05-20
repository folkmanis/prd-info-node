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
import { Controller, Get, Post, ClassErrorMiddleware } from '@overnightjs/core';
import { Request, Response, Express } from 'express';
import { logError } from '../lib/errorMiddleware';
import { UsersDAO } from '../dao/usersDAO';
import { Login, LoginResponse } from '../interfaces';

type Session = Express.Session;

@ClassErrorMiddleware(logError)
@Controller('data/login')
export class LoginController {

    @Post('')
    private async login(req: Request, res: Response) {
        if (!req.body.username || !req.body.password) {  // Ja tukšs pieprasījums
            if (req.session && req.session.user) {
                req.log.info('User logged out', { user: req.session.user });
                res.json(
                    await this.logout(req.session)
                );
            } else {
                res.json({ error: 'Invalid username' });
            }
            return;
        }
        if (req.session) { // Ja ir sesija, tad izdzēš
            await new Promise((resolve, reject) => {
                req.session?.regenerate((err) => {  // Sesijas dzēšana
                    err ? reject(err) : resolve();
                });
            });
        }

        const login: Login = {
            username: req.body.username,
            password: crypto.createHash('sha256').update(req.body.password).digest('hex'),
        };

        const loginResponse = await UsersDAO.login(login);

        if (loginResponse.data) {
            req.log.info('User logged in', { user: loginResponse.data });
        } else {
            req.log.error('Login failed', req.body);
        }
        if (req.session && loginResponse.data) {
            req.session.user = loginResponse.data;
        }
        res.json(loginResponse);
    }

    private async logout(session: Session): Promise<LoginResponse> {
        return new Promise<LoginResponse>((resolve, reject) => {
            session.destroy((err) => {
                if (err) {
                    reject({ error: err });
                } else {
                    resolve({
                        error: null,
                        modifiedCount: 1,
                        data: undefined,
                    });
                }
            });
        });
    }

    @Get('')
    private user(req: Request, res: Response) {
        if (req.session && req.session.user) {
            res.json({
                error: null,
                data: req.session.user
            });
        }
        else {
            res.json({
                error: 'Not logged in'
            });
        }
    }

}
