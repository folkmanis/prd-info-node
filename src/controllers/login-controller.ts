import { ClassErrorMiddleware, ClassWrapper, Controller, Get, Post, Middleware } from '@overnightjs/core';
import crypto from 'crypto';
import { Request, Response } from 'express';
import session from 'express-session';
import { asyncWrapper } from '../lib/asyncWrapper';
import { MessagesDao, UsersDao } from '../dao';
import { Login, LoginResponse, Modules } from '../interfaces';
import { logError } from '../lib/errorMiddleware';
import { Preferences } from '../lib/preferences-handler';
import { PrdSession } from '../lib/session-handler';

@ClassErrorMiddleware(logError)
@Controller('data/login')
@ClassWrapper(asyncWrapper)
export class LoginController {

    constructor(
        private usersDao: UsersDao,
        private messagesDao: MessagesDao,
    ) { }

    @Post('messages/allRead')
    async allMessagesRead(req: Request, res: Response) {

        if (!req.session.user) {
            res.json({
                error: false,
                modifiedCount: 0,
            });
            return;
        }

        res.json({
            error: false,
            modifiedCount: await this.messagesDao.allMessagesRead(req.session.user.username),
        });
    }

    @Post('')
    private async login(req: Request, res: Response) {
        if (!req.body.username || !req.body.password) {  // Ja tukšs pieprasījums
            if (req.session && req.session.user) {
                req.log.info('User logged out', { user: req.session.user });
                res.json(
                    await this.logout(req.session)
                );
            } else {
                res.json({ error: undefined });
            }
            return;
        }
        if (req.session) { // Ja ir sesija, tad izdzēš
            await new Promise<void>((resolve, reject) => {
                req.session?.regenerate((err) => {  // Sesijas dzēšana
                    err ? reject(err) : resolve();
                });
            });
        }

        const login: Login = {
            username: req.body.username,
            password: crypto.createHash('sha256').update(req.body.password).digest('hex'),
            // userDisabled: false,
        };

        const loginResponse = await this.usersDao.login(login);

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

    private async logout(session: session.Session): Promise<LoginResponse> {
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

    @Middleware([
        Preferences.getUserPreferences,
        PrdSession.validateSession,
    ])
    @Get('messages')
    async getMessages(req: Request, res: Response) {
        const fromDate: Date = new Date(+(req.query.from as string) || 0);
        const toDate: Date = new Date();
        const modules: Modules[] = req.userPreferences?.modules || [];
        res.json({
            error: false,
            timestamp: toDate,
            data: await this.messagesDao.getMessages(fromDate, toDate, modules, req.session.user?.username || ''),
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
